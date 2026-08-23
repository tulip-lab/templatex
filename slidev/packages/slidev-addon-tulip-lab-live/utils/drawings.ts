export const MAX_DRAWING_BYTES = 64 * 1024

const ALLOWED_ELEMENTS = new Set(['defs', 'ellipse', 'g', 'line', 'marker', 'path', 'rect'])
const ALLOWED_ATTRIBUTES = new Set([
  'cx', 'cy', 'd', 'data-drauu_index', 'fill', 'height', 'id', 'marker-end',
  'markerHeight', 'markerWidth', 'orient', 'refX', 'refY', 'rx', 'ry', 'stroke',
  'stroke-dasharray', 'stroke-linecap', 'stroke-width', 'viewBox', 'width',
  'x', 'x1', 'x2', 'y', 'y1', 'y2',
])
const COLOR_PATTERN = /^(?:#[\da-f]{3,8}|rgba?\([\d\s.,%+-]+\)|[a-z]+)$/i
const NUMBER_PATTERN = /^-?(?:\d+\.?\d*|\.\d+)$/
const NUMBER_LIST_PATTERN = /^[\d\s.,eE+-]+$/
const PATH_PATTERN = /^[MmLlHhVvCcSsQqTtAaZz\d\s.,eE+-]+$/

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength
}

function isSafeAttribute(name: string, value: string) {
  if (/[<>&]/.test(value) || /javascript:/i.test(value))
    return false
  if (['fill', 'stroke'].includes(name))
    return COLOR_PATTERN.test(value)
  if (name === 'd')
    return PATH_PATTERN.test(value)
  if (name === 'id')
    return /^[\w-]+$/.test(value)
  if (name === 'marker-end')
    return /^url\(#[\w-]+\)$/.test(value)
  if (name === 'data-drauu_index')
    return /^\d+$/.test(value)
  if (['viewBox', 'stroke-dasharray'].includes(name))
    return NUMBER_LIST_PATTERN.test(value)
  if (name === 'stroke-linecap')
    return ['butt', 'round', 'square'].includes(value)
  if (name === 'orient')
    return value === 'auto' || NUMBER_PATTERN.test(value)
  return NUMBER_PATTERN.test(value)
}

/** Validate and normalize the SVG fragment emitted by Drauu. */
export function sanitizeDrawingFragment(fragment: unknown): string | null {
  if (typeof fragment !== 'string' || byteLength(fragment) > MAX_DRAWING_BYTES)
    return null
  if (!fragment)
    return ''

  const template = document.createElement('template')
  template.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${fragment}</svg>`
  const root = template.content.firstElementChild
  if (!root || root.localName !== 'svg')
    return null

  for (const element of root.querySelectorAll('*')) {
    if (!ALLOWED_ELEMENTS.has(element.localName))
      return null
    for (const attribute of element.attributes) {
      if (!ALLOWED_ATTRIBUTES.has(attribute.name) || !isSafeAttribute(attribute.name, attribute.value))
        return null
    }
  }

  const normalized = root.innerHTML
  return byteLength(normalized) <= MAX_DRAWING_BYTES ? normalized : null
}
