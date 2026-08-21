export function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function asTextList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
    : []
}

export interface LinkItem {
  label: string
  url: string
}

export interface ResearchArea {
  title: string
  description: string
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

export function asLinkList(value: unknown): LinkItem[] {
  if (!Array.isArray(value))
    return []

  return value.flatMap((item) => {
    const record = asRecord(item)
    const label = asText(record?.label)
    const url = asText(record?.url)
    return label && url ? [{ label, url }] : []
  })
}

export function asResearchAreaList(value: unknown): ResearchArea[] {
  if (!Array.isArray(value))
    return []

  return value.flatMap((item) => {
    const record = asRecord(item)
    const title = asText(record?.title)
    const description = asText(record?.description)
    return title && description ? [{ title, description }] : []
  })
}

export function resolvePublicAssetPath(assetPath: string, baseUrl: string): string {
  if (!assetPath.startsWith('/') || assetPath.startsWith('//'))
    return assetPath

  return `${baseUrl.replace(/\/?$/, '/')}${assetPath.slice(1)}`
}
