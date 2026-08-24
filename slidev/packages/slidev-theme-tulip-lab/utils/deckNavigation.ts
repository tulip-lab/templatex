export interface DeckSession {
  code: string
  title: string
  page: number
  optionalStory: boolean
}

export interface DeckSection {
  label: string
  block?: string
  page: number
  showInToc: boolean
  showInNavigation: boolean
  tocExpand: boolean
  sessions: DeckSession[]
}

export interface NavigationFrontmatter {
  section?: unknown
  block?: unknown
  toc?: unknown
  navigation?: unknown
  tocExpand?: unknown
  session?: unknown
  sessionTitle?: unknown
  optionalStory?: unknown
}

export const OPTIONAL_STORY_INTENT_KEY = 'tulip:optional-story-intent'
export const OPTIONAL_STORY_QUERY_KEY = 'optional-story'

export interface NavigationRoute {
  no: number
  frontmatter: NavigationFrontmatter
}

export interface ActiveDeckItem {
  section: DeckSection
  sectionIndex: number
  session?: DeckSession
  sessionIndex: number
}

export interface ShellVisibility {
  showLocation: boolean
  showLogo: boolean
  showBottom: boolean
}

function asLabel(value: unknown): string | undefined {
  if (typeof value === 'number')
    return String(value)
  if (typeof value !== 'string')
    return undefined

  const label = value.trim()
  return label || undefined
}

export function buildDeckSections(routes: NavigationRoute[]): DeckSection[] {
  const sections: DeckSection[] = []
  let currentSection: DeckSection | undefined

  for (const route of routes) {
    const frontmatter = route.frontmatter ?? {}
    const sectionLabel = asLabel(frontmatter.section)

    if (sectionLabel) {
      currentSection = {
        label: sectionLabel,
        block: asLabel(frontmatter.block),
        page: route.no,
        showInToc: frontmatter.toc !== false,
        showInNavigation: frontmatter.toc !== false && frontmatter.navigation !== false,
        tocExpand: frontmatter.tocExpand !== false,
        sessions: [],
      }
      sections.push(currentSection)
    }

    const sessionCode = asLabel(frontmatter.session)
    if (!currentSection || !sessionCode)
      continue

    currentSection.sessions.push({
      code: sessionCode,
      title: asLabel(frontmatter.sessionTitle) ?? sessionCode,
      page: route.no,
      optionalStory: frontmatter.optionalStory === true,
    })
  }

  return sections
}

export function visibleDeckSections(sections: DeckSection[]): DeckSection[] {
  return sections.filter(section => section.showInToc)
}

export function navigableDeckSections(sections: DeckSection[]): DeckSection[] {
  return sections.filter(section => section.showInNavigation)
}

export function formatSectionLabel(section: DeckSection): string {
  return section.block ? `${section.block} ${section.label}` : section.label
}

export function formatSessionLabel(session: DeckSession): string {
  return session.title === session.code
    ? session.code
    : `${session.code} · ${session.title}`
}

export function findActiveItem(sections: DeckSection[], page: number): ActiveDeckItem | undefined {
  const sectionIndex = sections.findLastIndex(section => section.page <= page)
  if (sectionIndex < 0)
    return undefined

  const section = sections[sectionIndex]
  const sessionIndex = section.sessions.findLastIndex(session => session.page <= page)

  return {
    section,
    sectionIndex,
    session: sessionIndex >= 0 ? section.sessions[sessionIndex] : undefined,
    sessionIndex,
  }
}

function tocWeight(section: DeckSection): number {
  return 1 + section.sessions.length * 0.5
}

export function splitSectionsForToc(sections: DeckSection[]): [DeckSection[], DeckSection[]] {
  if (sections.length < 2)
    return [sections, []]

  const target = sections.reduce((sum, section) => sum + tocWeight(section), 0) / 2
  let weight = 0
  let splitIndex = 1

  for (let index = 0; index < sections.length - 1; index += 1) {
    weight += tocWeight(sections[index])
    splitIndex = index + 1
    if (weight >= target)
      break
  }

  return [sections.slice(0, splitIndex), sections.slice(splitIndex)]
}

export function getShellVisibility(
  layout: string | undefined,
  navigation: string | undefined,
  hasSection: boolean,
): ShellVisibility {
  const isCover = layout === 'cover'

  return {
    showLocation: !isCover && navigation !== 'toc' && hasSection,
    showLogo: !isCover,
    showBottom: !isCover,
  }
}

export function getProgressPercentage(currentPage: number, totalPages: number): number {
  if (totalPages <= 0)
    return 0

  return Math.min(100, Math.max(0, (currentPage / totalPages) * 100))
}
