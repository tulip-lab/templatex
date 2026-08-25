#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'
import { auditSlide, compareSwitchGeometry } from './visual-audit.mjs'

export function parseArgs(argv) {
  const options = { deck: '', entry: 'slides.md', output: '', url: '' }
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index]
    if (value === '--') {
      continue
    }
    if (value === '--entry' || value === '--output' || value === '--url') {
      const next = argv[++index]
      if (!next)
        throw new Error(`${value} requires a value`)
      options[value.slice(2)] = next
    }
    else if (value === '--help' || value === '-h') {
      options.help = true
    }
    else if (value.startsWith('-')) {
      throw new Error(`Unknown option: ${value}`)
    }
    else if (!options.deck) {
      options.deck = value
    }
    else {
      throw new Error(`Unexpected argument: ${value}`)
    }
  }
  return options
}

async function freePort() {
  return await new Promise((resolvePort, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(error => error ? reject(error) : resolvePort(port))
    })
  })
}

async function waitForDeck(url, processOutput, timeout = 120_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok)
        return
    }
    catch {}
    if (processOutput.exitCode !== null)
      throw new Error(`Slidev exited before it became ready.\n${processOutput.output}`)
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}.\n${processOutput.output}`)
}

function startSlidev(deck, entry, port) {
  const child = spawn('pnpm', [
    'exec', 'slidev', entry, '--port', String(port), '--remote', '127.0.0.1',
    '--log', 'error', '--force',
  ], { cwd: deck, env: { ...process.env, BROWSER: 'none' }, stdio: ['ignore', 'pipe', 'pipe'] })
  const state = { child, exitCode: null, output: '' }
  const record = chunk => state.output = `${state.output}${chunk}`.slice(-20_000)
  child.stdout.on('data', record)
  child.stderr.on('data', record)
  child.on('exit', code => state.exitCode = code)
  return state
}

async function stopSlidev(server) {
  if (!server || server.child.exitCode !== null)
    return
  server.child.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => server.child.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 3_000)),
  ])
  if (server.child.exitCode === null)
    server.child.kill('SIGKILL')
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'deck'
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function buildContactSheet(report) {
  const cards = report.states.map((state) => {
    const badges = state.findings.map(finding => `<span class="${finding.severity}">${escapeHtml(finding.severity)}: ${escapeHtml(finding.code)}</span>`).join('')
    return `<article><a href="${escapeHtml(state.screenshot)}"><img src="${escapeHtml(state.screenshot)}" alt="Slide ${state.slide}, click ${state.click}"></a><div><strong>Slide ${state.slide} · click ${state.click}</strong><small>${escapeHtml(state.layout)}${state.title ? ` · ${escapeHtml(state.title)}` : ''}</small><p>${badges || '<span class="pass">automated checks passed</span>'}</p></div></article>`
  }).join('\n')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>TULIP deck visual audit</title><style>body{margin:0;background:#f5f3fa;color:#1d2b3a;font:15px/1.45 system-ui,sans-serif}header{padding:24px 3vw;background:#fff;border-bottom:1px solid #d9d2e8}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px;padding:24px 3vw}article{overflow:hidden;background:#fff;border:1px solid #d9d2e8;border-radius:8px}img{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;background:#eee}article div{padding:12px 14px}small{display:block;color:#596574}p{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}span{padding:3px 7px;border-radius:4px;font-size:12px}.error{background:#fae8e6;color:#8d332e}.warning{background:#fff2d8;color:#74510c}.human-review{background:#eee9f8;color:#553f83}.pass{background:#e9f4ee;color:#266349}</style></head><body><header><h1>TULIP deck visual audit</h1><p>${escapeHtml(report.deck)} · ${report.summary.states} rendered states · ${report.summary.errors} errors · ${report.summary.warnings} warnings · ${report.summary.humanReview} human-review prompts</p></header><main>${cards}</main></body></html>`
}

function usage() {
  return `Usage: pnpm check:deck-visual -- [--entry slides.md] [--output DIR] [--url URL] /absolute/path/to/deck`
}

async function prepareState(page, baseUrl, slide, click) {
  const url = `${baseUrl.replace(/\/$/, '')}/${slide}?clicks=${click}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(({ slide, click }) => window.__slidev__?.nav?.currentPage === slide && window.__slidev__.nav.clicks === click, { slide, click })
  await page.locator(`.slidev-page-${slide} .slidev-layout`).last().waitFor({ state: 'visible' })
  await page.waitForFunction((slide) => {
    const element = document.querySelector(`.slidev-page-${slide}`)
    return element && Number.parseFloat(getComputedStyle(element).opacity) > 0.99
  }, slide)
  await page.evaluate(async () => await document.fonts.ready)
  await page.addStyleTag({ content: '*,*::before,*::after{animation-delay:0s!important;animation-duration:0s!important;caret-color:transparent!important;transition-delay:0s!important;transition-duration:0s!important}' })
  await page.waitForTimeout(25)
}

export async function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) {
    console.log(usage())
    return 0
  }
  if (!options.deck)
    throw new Error(`${usage()}\nA deck directory is required.`)

  const deck = resolve(options.deck)
  const entries = await readdir(deck)
  if (!entries.includes(options.entry))
    throw new Error(`Deck entry not found: ${join(deck, options.entry)}`)

  const workspace = resolve(fileURLToPath(new URL('..', import.meta.url)))
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const output = options.output
    ? resolve(options.output)
    : join(workspace, 'output', 'deck-visual', `${slug(basename(deck))}-${stamp}`)
  const screenshotsDir = join(output, 'screenshots')
  await mkdir(screenshotsDir, { recursive: true })

  let server
  let browser
  const port = options.url ? null : await freePort()
  const baseUrl = options.url || `http://127.0.0.1:${port}`
  const report = {
    generatedAt: new Date().toISOString(),
    deck,
    entry: options.entry,
    viewport: { width: 1280, height: 800 },
    states: [],
    summary: { slides: 0, states: 0, errors: 0, warnings: 0, humanReview: 0 },
  }

  try {
    if (!options.url) {
      server = startSlidev(deck, options.entry, port)
      await waitForDeck(baseUrl, server)
    }
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({
      colorScheme: 'light',
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 800 },
    })
    await prepareState(page, baseUrl, 1, 0)
    report.summary.slides = await page.evaluate(() => window.__slidev__.nav.total)

    for (let slide = 1; slide <= report.summary.slides; slide++) {
      if (slide !== 1)
        await prepareState(page, baseUrl, slide, 0)
      const clicksTotal = await page.evaluate(() => window.__slidev__.nav.clicksTotal)
      const slideStates = []
      for (let click = 0; click <= clicksTotal; click++) {
        if (click !== 0)
          await prepareState(page, baseUrl, slide, click)
        const audit = await auditSlide(page, slide)
        const screenshot = `screenshots/slide-${String(slide).padStart(3, '0')}-click-${String(click).padStart(2, '0')}.png`
        await page.locator(`.slidev-page-${slide}`).screenshot({ path: join(output, screenshot) })
        const state = {
          slide,
          click,
          layout: audit.layout,
          title: await page.locator(`.slidev-page-${slide} h1`).first().textContent().catch(() => '') || audit.frontmatter.title || '',
          screenshot,
          contentCoverage: audit.contentCoverage,
          takeawayGap: audit.takeawayGap,
          geometry: audit.geometry,
          findings: audit.findings,
        }
        slideStates.push(state)
        report.states.push(state)
      }
      const geometryFindings = compareSwitchGeometry(slideStates)
      if (geometryFindings.length)
        slideStates.at(-1).findings.push(...geometryFindings)
    }
  }
  finally {
    await browser?.close()
    await stopSlidev(server)
  }

  report.summary.states = report.states.length
  for (const state of report.states) {
    report.summary.errors += state.findings.filter(finding => finding.severity === 'error').length
    report.summary.warnings += state.findings.filter(finding => finding.severity === 'warning').length
    report.summary.humanReview += state.findings.filter(finding => finding.severity === 'human-review').length
  }
  await writeFile(join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  await writeFile(join(output, 'index.html'), buildContactSheet(report))
  console.log(`Audited ${report.summary.slides} slides / ${report.summary.states} states`)
  console.log(`${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.humanReview} human-review prompts`)
  console.log(`Report: ${join(output, 'report.json')}`)
  console.log(`Contact sheet: ${join(output, 'index.html')}`)
  return report.summary.errors ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().then(code => process.exitCode = code).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
