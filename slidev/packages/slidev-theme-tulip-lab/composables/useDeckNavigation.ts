import { computed } from 'vue'
import { useNav } from '@slidev/client'
import { buildDeckSections, findActiveItem } from '../utils/deckNavigation'
import type { NavigationRoute } from '../utils/deckNavigation'

export * from '../utils/deckNavigation'

export function useDeckNavigation() {
  const nav = useNav()

  const routes = computed<NavigationRoute[]>(() => nav.slides.value.map(route => ({
    no: route.no,
    frontmatter: route.meta.slide?.frontmatter ?? {},
  })))
  const sections = computed(() => buildDeckSections(routes.value))
  const activeItem = computed(() => findActiveItem(sections.value, nav.currentPage.value))

  return {
    nav,
    sections,
    activeItem,
    currentSection: computed(() => activeItem.value?.section),
    currentSectionIndex: computed(() => activeItem.value?.sectionIndex ?? -1),
    currentSession: computed(() => activeItem.value?.session),
    currentSessionIndex: computed(() => activeItem.value?.sessionIndex ?? -1),
  }
}
