export async function auditSlide(page, slideNumber) {
  return page.locator(`.slidev-page-${slideNumber} .slidev-layout`).last().evaluate((slide) => {
    const issue = (severity, code, message, elements = []) => ({ severity, code, message, elements })
    const rectJson = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    const label = (element) => {
      const classes = typeof element.className === 'string'
        ? element.className.trim().split(/\s+/).slice(0, 4).join('.')
        : ''
      return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${classes ? `.${classes}` : ''}`
    }
    const visible = (element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0.01
        && rect.width > 1
        && rect.height > 1
    }
    const hasDirectText = element => [...element.childNodes]
      .some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    const rgb = (value) => {
      const parts = value.match(/[\d.]+/g)?.map(Number) ?? []
      return parts.length >= 3 ? { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 } : null
    }
    const colourDistance = (a, b) => a && b
      ? Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
      : Number.POSITIVE_INFINITY
    const resolveSize = (property) => {
      const probe = document.createElement('span')
      probe.style.cssText = `position:absolute;visibility:hidden;font-size:var(${property})`
      slide.append(probe)
      const size = Number.parseFloat(getComputedStyle(probe).fontSize)
      probe.remove()
      return size
    }

    const findings = []
    const slideRect = slide.getBoundingClientRect()
    const captionFloor = resolveSize('--tulip-caption-size')
    const supportingFloor = resolveSize('--tulip-small-size')
    const all = [...slide.querySelectorAll('*')]
    const textElements = all
      .filter(element => visible(element) && hasDirectText(element))
      .filter(element => element.getAttribute('aria-hidden') !== 'true')
      .filter(element => !element.closest('math, .katex'))
      .filter(element => !element.closest('[data-visual-kind="image"], [data-visual-kind="document"], [data-visual-kind="plot"]'))
    const mathRoots = all
      .filter(element => visible(element) && element.matches('math, .katex'))
      .filter(element => !element.parentElement?.closest('math, .katex'))

    const belowCaption = [...textElements, ...mathRoots]
      .filter(element => !element.matches('sub, sup'))
      .filter(element => Number.parseFloat(getComputedStyle(element).fontSize) + 0.1 < captionFloor)
      .map(element => `${label(element)}=${getComputedStyle(element).fontSize}`)
    if (belowCaption.length)
      findings.push(issue('error', 'font-below-caption-floor', `Visible text is smaller than the ${captionFloor}px caption floor.`, belowCaption))

    const tinyProse = textElements
      .filter(element => ['P', 'LI', 'BLOCKQUOTE', 'DD', 'DT'].includes(element.tagName))
      .filter(element => !element.matches('.tulip-caption, .tulip-label'))
      .filter(element => Number.parseFloat(getComputedStyle(element).fontSize) + 0.1 < supportingFloor)
      .map(element => `${label(element)}=${getComputedStyle(element).fontSize}`)
    if (tinyProse.length)
      findings.push(issue('warning', 'prose-below-supporting-size', `Prose is smaller than the ${supportingFloor}px supporting-copy size.`, tinyProse))

    const overflowSelectors = [
      '.tulip-title-region', '.tulip-slide-body', '.tulip-layout-content',
      '.tulip-cover-main', '.tulip-balanced-content', '.tulip-switch-stage',
      '.collaborations-grid', '.network-stage', '.contact-wrap', '.business-card',
      '.standard-content', '.speaker-grid', '.deakin-shell', '.deakin-stage',
      '.acknowledgements-wrap', '.questions-wrap', '.framework-content',
      '.region-content', '[data-visual-audit-region]',
    ]
    const overflowElements = [...new Set(overflowSelectors.flatMap(selector => [...slide.querySelectorAll(selector)]))]
      .filter(element => visible(element))
      .filter(element => element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)
      .map(element => `${label(element)} (${element.clientWidth}x${element.clientHeight} < ${element.scrollWidth}x${element.scrollHeight})`)
    const clippedElements = all
      .filter(element => visible(element) && (hasDirectText(element) || ['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(element.tagName)))
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.left < slideRect.left - 2 || rect.top < slideRect.top - 2
          || rect.right > slideRect.right + 2 || rect.bottom > slideRect.bottom + 2
      })
      .map(label)
    const overflow = [...new Set([...overflowElements, ...clippedElements])]
    if (overflow.length)
      findings.push(issue('error', 'overflow', 'Visible content overflows or leaves the slide canvas.', overflow))

    const surfacePattern = /(card|panel|stage|block|tile|callout|takeaway|note|case|risk|evidence)/i
    const surfaceCandidates = all
      .filter(element => visible(element) && (
        surfacePattern.test(typeof element.className === 'string' ? element.className : '')
        || element.matches('.col-left, .col-right, [data-visual-audit-surface]')
      ))
      .filter(element => !element.matches('.slidev-layout, .tulip-layout-content, .tulip-slide-body, .tulip-balanced-content'))
      .filter(element => !element.closest('[data-visual-kind="image"], [data-visual-kind="document"], [data-visual-kind="plot"]'))
    const canvas = rgb(getComputedStyle(slide).backgroundColor)
    const whiteOnWhite = surfaceCandidates
      .filter((element) => {
        const style = getComputedStyle(element)
        const background = rgb(style.backgroundColor)
        const border = rgb(style.borderTopColor)
        const borderWidth = Number.parseFloat(style.borderTopWidth)
        return background?.a > 0.85
          && colourDistance(background, canvas) < 7
          && (borderWidth < 1 || border?.a === 0 || colourDistance(border, canvas) < 12)
      })
      .map(label)
    if (whiteOnWhite.length)
      findings.push(issue('error', 'white-on-white-surface', 'A content surface disappears into the white slide canvas.', whiteOnWhite))

    const tokenClasses = [
      'tulip-card', 'tulip-card tulip-card--subtle', 'tulip-card tulip-card--soft',
      'tulip-card tulip-card--strong', 'tulip-card tulip-card--blue',
      'tulip-card tulip-card--warm', 'tulip-card tulip-card--green',
      'tulip-card tulip-card--purple', 'tulip-card tulip-card--red',
      'tulip-card tulip-card--risk', 'tulip-card tulip-card--warning',
      'tulip-card tulip-card--outcome', 'tulip-evidence-panel', 'tulip-case-panel',
      'tulip-switch-step', 'tulip-switch-step is-active', 'tulip-switch-step is-output',
      'tulip-switch-stage', 'tulip-takeaway',
    ]
    const allowedBackgrounds = new Set()
    for (const className of tokenClasses) {
      const probe = document.createElement('div')
      probe.className = className
      probe.style.cssText = 'position:absolute;visibility:hidden'
      slide.append(probe)
      allowedBackgrounds.add(getComputedStyle(probe).backgroundColor)
      probe.remove()
    }
    for (const token of [
      '--tulip-canvas', '--tulip-accent-soft', '--tulip-block-surface-inset',
      '--tulip-block-surface-subtle', '--tulip-block-surface',
      '--tulip-block-surface-soft', '--tulip-block-surface-strong',
      '--tulip-state-idle', '--tulip-state-active', '--tulip-state-output',
    ]) {
      const probe = document.createElement('div')
      probe.style.cssText = `position:absolute;visibility:hidden;background:var(${token})`
      slide.append(probe)
      allowedBackgrounds.add(getComputedStyle(probe).backgroundColor)
      probe.remove()
    }
    allowedBackgrounds.add(getComputedStyle(slide).backgroundColor)

    const gradients = surfaceCandidates
      .filter(element => getComputedStyle(element).backgroundImage.includes('gradient'))
      .map(label)
    if (gradients.length)
      findings.push(issue('warning', 'decorative-gradient', 'Content surfaces use gradients outside the flat Theme contract.', gradients))
    const shadows = surfaceCandidates
      .filter(element => getComputedStyle(element).boxShadow !== 'none')
      .map(label)
    if (shadows.length)
      findings.push(issue('warning', 'decorative-shadow', 'Content surfaces use shadows outside the flat Theme contract.', shadows))
    const offContractColours = surfaceCandidates
      .filter((element) => {
        const style = getComputedStyle(element)
        const background = rgb(style.backgroundColor)
        return background?.a > 0.08
          && !allowedBackgrounds.has(style.backgroundColor)
          && !element.matches('[data-visual-audit-colour="allow"]')
      })
      .map(element => `${label(element)}=${getComputedStyle(element).backgroundColor}`)
    if (offContractColours.length)
      findings.push(issue('warning', 'off-contract-surface-colour', 'A content surface uses a colour outside the Theme surface contract.', offContractColours))

    const darkProsePanels = surfaceCandidates
      .filter(element => element.matches('.tulip-case-panel'))
      .filter(element => element.querySelector('p, blockquote, ul, ol') && !element.querySelector('pre, code'))
      .filter((element) => {
        const background = rgb(getComputedStyle(element).backgroundColor)
        return background && (background.r + background.g + background.b) / 3 < 90
      })
      .map(label)
    if (darkProsePanels.length)
      findings.push(issue('error', 'dark-prose-panel', 'Dark case panels are reserved for code, traces, logs, and raw machine output.', darkProsePanels))

    const balancedContent = slide.querySelector('.tulip-balanced-content')
    const takeaway = slide.querySelector('.tulip-takeaway--bottom')
    let takeawayGap = null
    if (takeaway && visible(takeaway)) {
      let evidenceBottom = balancedContent && visible(balancedContent)
        ? balancedContent.getBoundingClientRect().bottom
        : null
      if (evidenceBottom === null) {
        const parent = takeaway.parentElement
        const predecessors = parent ? [...parent.children].filter(element => element !== takeaway && visible(element)) : []
        if (predecessors.length)
          evidenceBottom = Math.max(...predecessors.map(element => element.getBoundingClientRect().bottom))
      }
      if (evidenceBottom !== null)
        takeawayGap = takeaway.getBoundingClientRect().top - evidenceBottom
      if (takeawayGap !== null && (takeawayGap < -2 || takeawayGap > 48))
        findings.push(issue('error', 'takeaway-gap', `The evidence-to-takeaway gap is ${Math.round(takeawayGap)}px; expected -2px to 48px.`))
    }

    const images = [...slide.querySelectorAll('img')]
    const failedImages = images
      .filter(image => visible(image) && (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0))
      .map(image => `${label(image)} src=${image.currentSrc || image.src}`)
    if (failedImages.length)
      findings.push(issue('error', 'failed-image', 'A visible image failed to load.', failedImages))

    const qrCandidates = [...new Set(all.filter(element => {
      const descriptor = `${typeof element.className === 'string' ? element.className : ''} ${element.getAttribute('alt') ?? ''}`
      return ['A', 'IMG', 'SVG'].includes(element.tagName) && /(^|[-_\s])qr($|[-_\s])/i.test(descriptor)
    }))]
    const qrProblems = []
    for (const qr of qrCandidates) {
      const anchor = qr.tagName === 'A' ? qr : qr.closest('a')
      const href = anchor?.getAttribute('href')?.trim()
      if (!visible(qr))
        qrProblems.push(`${label(qr)} is not visible`)
      if (!href || href === '#' || /^javascript:/i.test(href))
        qrProblems.push(`${label(qr)} has no usable link target`)
      if (qr.tagName === 'IMG' && (!qr.complete || qr.naturalWidth === 0))
        qrProblems.push(`${label(qr)} did not render an image`)
    }
    if (qrProblems.length)
      findings.push(issue('error', 'qr-visibility-or-target', 'A QR mark is hidden, broken, or lacks a usable target.', qrProblems))

    const layout = window.__slidev__?.nav?.currentLayout ?? ''
    const frontmatter = window.__slidev__?.nav?.currentFrontmatter ?? {}
    const sparse = frontmatter.visualAudit === 'sparse'
      || ['section', 'toc', 'questions', 'contact', 'cover', 'tulip-questions', 'tulip-contact'].includes(layout)
    const body = slide.querySelector('.tulip-slide-body, .tulip-layout-content')
    let contentCoverage = null
    if (body && visible(body)) {
      const bodyRect = body.getBoundingClientRect()
      const contentRects = [...new Set([
        ...textElements,
        ...surfaceCandidates,
        ...all.filter(element => ['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(element.tagName) && visible(element)),
      ])].map(element => element.getBoundingClientRect())
      let occupied = 0
      let total = 0
      const columns = 24
      const rows = 15
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const px = bodyRect.left + (x + 0.5) * bodyRect.width / columns
          const py = bodyRect.top + (y + 0.5) * bodyRect.height / rows
          total++
          if (contentRects.some(rect => px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom))
            occupied++
        }
      }
      contentCoverage = total ? occupied / total : 0
      if (!sparse && contentCoverage < 0.18)
        findings.push(issue('warning', 'low-content-coverage', `Only ${Math.round(contentCoverage * 100)}% of the main content area is occupied.`))
    }

    const visualEvidence = slide.querySelector('[data-semantic-role], [data-visual-kind], figure, canvas, .tulip-switch-stage svg:not([class*="qr" i])')
    if (visualEvidence)
      findings.push(issue('human-review', 'semantic-visual-review', 'Confirm the visual has clear reading order, labels, provenance, and supports the slide claim.'))

    const geometry = {}
    const geometrySelectors = ['.tulip-switch', '.tulip-switch-stage', '[data-visual-audit-switch]', '[data-visual-audit-stage]']
    for (const selector of geometrySelectors) {
      ;[...slide.querySelectorAll(selector)].filter(visible).forEach((element, index) => {
        geometry[`${selector}:${index}`] = rectJson(element.getBoundingClientRect())
      })
    }

    return {
      contentCoverage,
      findings,
      frontmatter: JSON.parse(JSON.stringify(frontmatter)),
      geometry,
      layout,
      takeawayGap,
    }
  })
}

export function compareSwitchGeometry(states, tolerance = 2) {
  if (states.length < 2)
    return []
  const baseline = states[0]
  const findings = []
  for (const state of states.slice(1)) {
    for (const [key, baselineRect] of Object.entries(baseline.geometry)) {
      const currentRect = state.geometry[key]
      if (!currentRect) {
        findings.push({
          severity: 'error',
          code: 'switch-geometry-drift',
          message: `${key} disappears between click ${baseline.click} and click ${state.click}.`,
          elements: [key],
        })
        continue
      }
      const changes = ['x', 'y', 'width', 'height']
        .filter(property => Math.abs(currentRect[property] - baselineRect[property]) > tolerance)
        .map(property => `${property}: ${baselineRect[property].toFixed(1)} -> ${currentRect[property].toFixed(1)}`)
      if (changes.length) {
        findings.push({
          severity: 'error',
          code: 'switch-geometry-drift',
          message: `${key} moves or resizes between click ${baseline.click} and click ${state.click}.`,
          elements: changes,
        })
      }
    }
  }
  return findings
}
