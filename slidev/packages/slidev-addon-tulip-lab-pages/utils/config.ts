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

export interface CollaborationPhoto {
  src: string
  alt: string
  fit?: 'cover' | 'contain'
}

export interface CollaborationRegion {
  name: string
  label: string
  institutions: string[]
  photos: CollaborationPhoto[]
  photoLayout?: 'portrait-feature'
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

export function asCollaborationRegions(value: unknown): CollaborationRegion[] {
  if (!Array.isArray(value))
    return []

  return value.flatMap((item) => {
    const record = asRecord(item)
    const name = asText(record?.name)
    const label = asText(record?.label)
    const institutions = asTextList(record?.institutions)
    const photoLayoutValue = asText(record?.photoLayout)
    const photoLayout = photoLayoutValue === 'portrait-feature' ? 'portrait-feature' : undefined
    const photos = Array.isArray(record?.photos)
      ? record.photos.flatMap((photo) => {
          const photoRecord = asRecord(photo)
          const src = asText(photoRecord?.src)
          const alt = asText(photoRecord?.alt)
          const fitValue = asText(photoRecord?.fit)
          const fit = fitValue === 'contain' ? 'contain' : undefined
          return src && alt ? [{ src, alt, fit }] : []
        })
      : []

    return name && institutions.length
      ? [{ name, label, institutions, photos, photoLayout }]
      : []
  })
}

export function resolvePublicAssetPath(assetPath: string, baseUrl: string): string {
  if (!assetPath.startsWith('/') || assetPath.startsWith('//'))
    return assetPath

  return `${baseUrl.replace(/\/?$/, '/')}${assetPath.slice(1)}`
}
