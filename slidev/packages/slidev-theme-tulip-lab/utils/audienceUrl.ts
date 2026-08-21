export function resolveAudienceUrl(baseUrl: string, origin: string): string {
  const normalisedOrigin = `${origin.replace(/\/+$/, '')}/`
  const normalisedBase = baseUrl.trim() || '/'

  return new URL(normalisedBase, normalisedOrigin).href
}
