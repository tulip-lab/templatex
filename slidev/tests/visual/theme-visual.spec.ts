import { expect, test, type Page } from '@playwright/test'
import { auditSlide } from '../../scripts/visual-audit.mjs'

const slideReadyTimeoutMs = 15_000

const visualCases = [
  { name: 'theme-cover', path: '/1', slide: 1, heading: 'TULIP Lab Slidev Layout Gallery' },
  { name: 'theme-toc', path: '/2', slide: 2, heading: 'Table of Contents' },
  { name: 'theme-section', path: '/3', slide: 3, heading: 'Core Layouts' },
  { name: 'theme-default', path: '/4', slide: 4, heading: 'Default Layout' },
  { name: 'theme-wideslide', path: '/5', slide: 5, heading: 'Wideslide Layout' },
  { name: 'theme-two-columns', path: '/6', slide: 6, heading: 'Two Columns' },
  { name: 'balanced-surfaces', path: '/7', slide: 7, heading: 'Visual Contract: Balanced Evidence Above a Stable Takeaway Without Leaving Unexplained Empty Space' },
  { name: 'switch-question', path: '/8?clicks=0', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'switch-evidence', path: '/8?clicks=1', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'switch-outcome', path: '/8?clicks=2', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'semantic-evidence', path: '/9', slide: 9, heading: 'Evidence: Show What the Process Changes' },
  { name: 'shared-speaker', path: '/10', slide: 10, heading: 'Professor Gang Li' },
  { name: 'shared-deakin-context', path: '/11?clicks=0', slide: 11, heading: 'Context and evidence' },
  { name: 'shared-deakin-evidence', path: '/11?clicks=1', slide: 11, heading: 'Context and evidence' },
  { name: 'shared-collaborations', path: '/12', slide: 12, heading: 'TULIP Lab' },
  { name: 'shared-collaboration-region', path: '/12?clicks=1', slide: 12, heading: 'TULIP Lab' },
  { name: 'shared-contact', path: '/13', slide: 13, heading: 'Stay Connected' },
  { name: 'theme-acknowledgements', path: '/14', slide: 14, heading: 'Acknowledgements' },
  { name: 'shared-questions', path: '/15', slide: 15, heading: 'Questions?', snapshot: false },
  { name: 'theme-references', path: '/16', slide: 16, heading: 'References' },
  { name: 'theme-contact', path: '/17', slide: 17, heading: 'Contact' },
]

async function preparePage(page: Page, path: string, heading: string) {
  await page.goto(path)
  // The first requested Slidev route is compiled lazily on a cold CI server.
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible({ timeout: slideReadyTimeoutMs })
  await page.evaluate(async () => await document.fonts.ready)
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  })
}

test('shared QR pages recover from missing static images and retain their targets', async ({ page }) => {
  await preparePage(page, '/12', 'TULIP Lab')
  const homeCard = page.locator('.slidev-page-12 .tulip-home-card')
  await expect(homeCard).toHaveAttribute('href', 'https://www.tulip.academy')
  await expect(homeCard.locator('svg.tulip-home-qr')).toBeVisible()
  await expect(homeCard).toHaveCSS('width', '336px')

  await preparePage(page, '/13', 'Stay Connected')
  const contactQr = page.locator('.slidev-page-13 .card-qr-link')
  await expect(contactQr).toHaveAttribute('href', 'https://www.tulip.academy/members/gangli/')
  await expect(contactQr.locator('svg.card-qr')).toBeVisible()
  await expect(contactQr.locator('svg.card-qr')).toHaveCSS('width', '64px')
  await expect(contactQr.locator('svg.card-qr')).toHaveCSS('height', '64px')
})

test('shared packaged identity media loads successfully', async ({ page }) => {
  await preparePage(page, '/10', 'Professor Gang Li')
  await expect(page.locator('.slidev-page-10 .speaker-photo')).toHaveJSProperty('complete', true)
  expect(await page.locator('.slidev-page-10 .speaker-photo').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  await preparePage(page, '/11', 'Context and evidence')
  const deakinMark = page.getByRole('img', { name: 'Deakin University' })
  await expect(deakinMark).toHaveJSProperty('complete', true)
  expect(await deakinMark.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  await preparePage(page, '/15', 'Questions?')
  const questionsAnimation = page.getByRole('img', { name: 'Questions animation' })
  await expect(questionsAnimation).toHaveJSProperty('complete', true)
  expect(await questionsAnimation.evaluate((image: HTMLImageElement) => ({
    height: image.naturalHeight,
    width: image.naturalWidth,
  }))).toEqual({ height: 360, width: 360 })
})

test('narrow viewport keeps essential footer controls without section crowding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await preparePage(page, '/2', 'Table of Contents')

  const footer = page.locator('.tulip-bottom-shell')
  await expect(footer).toBeVisible()
  await expect(footer.locator('.tulip-footer-leading')).toBeVisible()
  await expect(footer.locator('.tulip-page-position')).toBeVisible()
  await expect(footer.locator('.tulip-section-links')).toBeHidden()
  expect(await footer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)

  if (process.platform === 'darwin')
    await expect(page).toHaveScreenshot('theme-toc-mobile.png')
})

for (const visualCase of visualCases) {
  test(`${visualCase.name} matches the reviewed theme contract`, async ({ page }) => {
    await preparePage(page, visualCase.path, visualCase.heading)

    const audit = await auditSlide(page, visualCase.slide)
    expect(audit.findings.filter(finding => finding.severity === 'error'), 'the shared audit must find no visual contract errors').toEqual([])
    if (process.platform === 'darwin' && visualCase.snapshot !== false)
      await expect(page).toHaveScreenshot(`${visualCase.name}.png`)
  })
}

test('switch outer frame and stage remain stable across click states', async ({ page }) => {
  const states = [
    { path: '/8?clicks=0', heading: 'Stable Staged Switch' },
    { path: '/8?clicks=1', heading: 'Stable Staged Switch' },
    { path: '/8?clicks=2', heading: 'Stable Staged Switch' },
  ]
  const geometry: Array<{ stage: DOMRect; switchFrame: DOMRect }> = []

  for (const state of states) {
    await preparePage(page, state.path, state.heading)
    geometry.push(await page.locator('.slidev-page-8 > .slidev-layout').evaluate((slide) => {
      const switchFrame = slide.querySelector<HTMLElement>('.tulip-switch')!.getBoundingClientRect()
      const stage = slide.querySelector<HTMLElement>('.tulip-switch-stage')!.getBoundingClientRect()
      const serialize = (rect: DOMRect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }) as DOMRect
      return { stage: serialize(stage), switchFrame: serialize(switchFrame) }
    }))
  }

  for (const current of geometry.slice(1)) {
    for (const region of ['switchFrame', 'stage'] as const) {
      for (const property of ['x', 'y', 'width', 'height'] as const)
        expect(current[region][property]).toBeCloseTo(geometry[0][region][property], 1)
    }
  }
})

test('shared Deakin and collaboration stages remain stable across click states', async ({ page }) => {
  const groups = [
    {
      states: ['/11?clicks=0', '/11?clicks=1'],
      heading: 'Context and evidence',
      slide: 11,
      selectors: ['.deakin-shell', '.deakin-stage'],
    },
    {
      states: ['/12?clicks=0', '/12?clicks=1'],
      heading: 'TULIP Lab',
      slide: 12,
      selectors: ['.collaborations-grid', '.network-stage'],
    },
  ]

  for (const group of groups) {
    const geometry: Array<Record<string, { x: number; y: number; width: number; height: number }>> = []
    for (const path of group.states) {
      await preparePage(page, path, group.heading)
      geometry.push(await page.locator(`.slidev-page-${group.slide} > .slidev-layout`).evaluate((slide, selectors) => Object.fromEntries(
        selectors.map((selector) => {
          const rect = slide.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
          return [selector, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }]
        }),
      ), group.selectors))
    }

    for (const selector of group.selectors) {
      for (const property of ['x', 'y', 'width', 'height'] as const)
        expect(geometry[1][selector][property]).toBeCloseTo(geometry[0][selector][property], 1)
    }
  }
})
