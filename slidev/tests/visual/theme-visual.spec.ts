import { expect, test, type Page } from '@playwright/test'

type VisualAudit = {
  fontFloor: string[]
  overflow: string[]
  takeawayGap: number | null
  whiteOnWhite: string[]
}

const visualCases = [
  { name: 'balanced-surfaces', path: '/7', slide: 7, heading: 'Visual Contract: Balanced Evidence Above a Stable Takeaway Without Leaving Unexplained Empty Space' },
  { name: 'switch-question', path: '/8?clicks=0', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'switch-evidence', path: '/8?clicks=1', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'switch-outcome', path: '/8?clicks=2', slide: 8, heading: 'Stable Staged Switch' },
  { name: 'semantic-evidence', path: '/9', slide: 9, heading: 'Evidence: Show What the Process Changes' },
]

async function preparePage(page: Page, path: string, heading: string) {
  await page.goto(path)
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
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

async function auditThemeSlide(page: Page, slideNumber: number): Promise<VisualAudit> {
  return page.locator(`.slidev-page-${slideNumber} > .slidev-layout`).evaluate((slide) => {
    const isVisible = (element: HTMLElement) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0
    }
    const label = (element: HTMLElement) => {
      const className = typeof element.className === 'string' ? element.className.trim().replace(/\s+/g, '.') : ''
      return `${element.tagName.toLowerCase()}${className ? `.${className}` : ''}`
    }

    const overflowSelectors = [
      '.tulip-title-region',
      '.tulip-slide-body',
      '.tulip-balanced-content',
      '.tulip-switch-stage',
    ]
    const overflow = overflowSelectors
      .flatMap(selector => [...slide.querySelectorAll<HTMLElement>(selector)])
      .filter(element => isVisible(element) && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1))
      .map(label)

    const probe = document.createElement('span')
    probe.style.fontSize = 'var(--tulip-caption-size)'
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    slide.append(probe)
    const captionFloor = Number.parseFloat(getComputedStyle(probe).fontSize)
    probe.remove()

    const textRegions = [...slide.querySelectorAll<HTMLElement>('.tulip-title-region, .tulip-slide-body')]
    const textElements = [...new Set(textRegions.flatMap(region => [region, ...region.querySelectorAll<HTMLElement>('*')]))]
      .filter(element => isVisible(element))
      .filter(element => element.getAttribute('aria-hidden') !== 'true')
      .filter(element => [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()))
    const fontFloor = textElements
      .filter(element => Number.parseFloat(getComputedStyle(element).fontSize) + 0.1 < captionFloor)
      .map(element => `${label(element)}=${getComputedStyle(element).fontSize}`)

    const canvas = getComputedStyle(slide).backgroundColor
    const surfaceSelectors = [
      '.tulip-card',
      '.tulip-switch-step',
      '.tulip-switch-stage',
      '.tulip-takeaway',
      '.col-left',
      '.col-right',
    ]
    const whiteOnWhite = surfaceSelectors
      .flatMap(selector => [...slide.querySelectorAll<HTMLElement>(selector)])
      .filter(isVisible)
      .filter(element => !element.closest('[data-visual-kind="image"], [data-visual-kind="document"], [data-visual-kind="plot"]'))
      .filter(element => getComputedStyle(element).backgroundColor === canvas)
      .map(label)

    const balancedContent = slide.querySelector<HTMLElement>('.tulip-balanced-content')
    const takeaway = slide.querySelector<HTMLElement>('.tulip-takeaway--bottom')
    const takeawayGap = balancedContent && takeaway && isVisible(balancedContent) && isVisible(takeaway)
      ? takeaway.getBoundingClientRect().top - balancedContent.getBoundingClientRect().bottom
      : null

    return { fontFloor, overflow, takeawayGap, whiteOnWhite }
  })
}

for (const visualCase of visualCases) {
  test(`${visualCase.name} matches the reviewed theme contract`, async ({ page }) => {
    await preparePage(page, visualCase.path, visualCase.heading)

    const audit = await auditThemeSlide(page, visualCase.slide)
    expect(audit.overflow, 'content must not overflow its stable regions').toEqual([])
    expect(audit.fontFloor, 'visible text must meet the projection caption floor').toEqual([])
    expect(audit.whiteOnWhite, 'content surfaces must remain visible on the white canvas').toEqual([])
    if (audit.takeawayGap !== null) {
      expect(audit.takeawayGap, 'balanced content must not leave an unexplained takeaway gap').toBeGreaterThanOrEqual(-1)
      expect(audit.takeawayGap, 'balanced content must not leave an unexplained takeaway gap').toBeLessThanOrEqual(32)
    }
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
