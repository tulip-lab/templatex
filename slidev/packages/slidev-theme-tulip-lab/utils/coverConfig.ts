export interface CoverConfig {
  title: string
  subtitle: string
  course: string
  author: string
  affiliation: string
  authorPhoto?: string
}

export function resolvePublicAssetPath(assetPath: string | undefined, baseUrl: string): string | undefined {
  if (!assetPath || !assetPath.startsWith('/') || assetPath.startsWith('//'))
    return assetPath

  return `${baseUrl.replace(/\/?$/, '/')}${assetPath.slice(1)}`
}

function asText(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined

  const text = value.trim()
  return text || undefined
}

export function normaliseCoverConfig(configs: Record<string, unknown>): CoverConfig {
  return {
    title: asText(configs.title) ?? 'Presentation Title',
    subtitle: asText(configs.subtitle) ?? '',
    course: asText(configs.course) ?? 'TULIP Lab',
    author: asText(configs.author) ?? '',
    affiliation: asText(configs.affiliation) ?? '',
    authorPhoto: asText(configs.authorPhoto),
  }
}
