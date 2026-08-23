export interface AcknowledgementPerson {
  name: string
  affiliation: string
  photo: string
}

export function asAcknowledgementText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

export function normaliseAcknowledgementPeople(value: unknown): AcknowledgementPerson[] {
  if (!Array.isArray(value))
    return []

  return value.flatMap((item) => {
    const record = asRecord(item)
    const name = asAcknowledgementText(record?.name)
    const affiliation = asAcknowledgementText(record?.affiliation)
    const photo = asAcknowledgementText(record?.photo)
    return name && affiliation && photo ? [{ name, affiliation, photo }] : []
  })
}
