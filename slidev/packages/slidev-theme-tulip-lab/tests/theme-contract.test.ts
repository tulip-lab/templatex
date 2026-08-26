import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const topShell = readFileSync(new URL('../global-top.vue', import.meta.url), 'utf8')
const bottomShell = readFileSync(new URL('../global-bottom.vue', import.meta.url), 'utf8')
const tableOfContents = readFileSync(new URL('../components/TableOfContents.vue', import.meta.url), 'utf8')
const qrCode = readFileSync(new URL('../components/AudienceQrCode.vue', import.meta.url), 'utf8')

test('defines the shared 16:10 Slidev contract', () => {
  assert.equal(packageJson.slidev.defaults.aspectRatio, '16/10')
  assert.equal(packageJson.slidev.defaults.canvasWidth, 1280)
  assert.equal(packageJson.slidev.defaults.layout, 'default')
})

test('ships the required layouts and brand assets', () => {
  for (const name of ['cover', 'toc', 'section', 'default', 'wideslide', 'two-cols-header', 'references', 'contact', 'tulip-lab-acknowledgements'])
    assert.ok(existsSync(new URL(`../layouts/${name}.vue`, import.meta.url)), `missing ${name} layout`)

  assert.ok(existsSync(new URL('../assets/tulip-logo.png', import.meta.url)))
  assert.ok(existsSync(new URL('../assets/tulip-wordmark.png', import.meta.url)))
  assert.ok(existsSync(new URL('../assets/gangli-author.webp', import.meta.url)))
  assert.ok(existsSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url)))
})

test('keeps navigation and TULIP Home in the theme but live sync in the addon', () => {
  assert.match(topShell, /useDeckNavigation/)
  assert.match(bottomShell, /https:\/\/www\.tulip\.academy\//)
  assert.match(bottomShell, /\{\{ section\.label \}\}/)
  assert.doesNotMatch(bottomShell, /formatSectionLabel/)
  assert.match(bottomShell, /nav\.router\.back\(\)/)
  assert.match(bottomShell, /carbon-undo/)
  assert.doesNotMatch(topShell, /SlideSyncBridge/)
  assert.match(qrCode, /import QrcodeVue from 'qrcode\.vue'/)
})

test('centres footer navigation and simplifies it on narrow viewports', () => {
  assert.match(bottomShell, /class="tulip-footer-leading"/)
  assert.match(bottomShell, /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 2fr\) minmax\(0, 1fr\)/)
  assert.match(bottomShell, /\.tulip-section-links\s*\{[\s\S]*justify-content:\s*center/)
  assert.match(bottomShell, /@media \(max-width:\s*720px\)[\s\S]*\.tulip-section-links\s*\{[\s\S]*display:\s*none/)
})

test('keeps interactive navigation keyboard-visible', () => {
  for (const selector of ['tulip-location-current', 'tulip-session-node'])
    assert.match(topShell, new RegExp(`\\.${selector}:focus-visible`))

  assert.match(bottomShell, /\.tulip-section-link:focus-visible/)
  for (const selector of ['tulip-toc-section', 'tulip-toc-session'])
    assert.match(tableOfContents, new RegExp(`\\.${selector}:focus-visible`))
})
