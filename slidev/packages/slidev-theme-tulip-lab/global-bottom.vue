<script setup lang="ts">
import { computed } from 'vue'
import { useDeckNavigation } from './composables/useDeckNavigation'
import wordmark from './assets/tulip-wordmark.png'
import {
  getProgressPercentage,
  getShellVisibility,
  navigableDeckSections,
} from './utils/deckNavigation'

const { nav, sections, currentSection } = useDeckNavigation()
const visibleSections = computed(() => navigableDeckSections(sections.value))
const activeSectionPage = computed(() => currentSection.value?.page)
const canGoBack = computed(() => {
  nav.currentPage.value
  return Boolean(nav.router.options.history.state.back)
})

const navigationMode = computed(() => {
  const value = nav.currentSlideRoute.value.meta.slide?.frontmatter?.navigation
  return typeof value === 'string' ? value : undefined
})
const visibility = computed(() => getShellVisibility(
  nav.currentLayout.value,
  navigationMode.value,
  Boolean(currentSection.value),
))
const progressWidth = computed(() => `${getProgressPercentage(nav.currentPage.value, nav.total.value)}%`)

function returnToPreviousLocation() {
  if (canGoBack.value)
    nav.router.back()
}
</script>

<template>
  <footer v-if="visibility.showBottom" class="tulip-bottom-shell">
    <div class="tulip-footer-leading">
      <a
        href="https://www.tulip.academy/"
        class="tulip-footer-wordmark-link"
        aria-label="TULIP Lab Home"
        title="TULIP Lab Home"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          :src="wordmark"
          class="tulip-footer-wordmark"
          alt="TULIP Lab"
        >
      </a>
      <button
        class="tulip-history-back"
        type="button"
        title="Return to previous location"
        aria-label="Return to previous location"
        :disabled="!canGoBack"
        @click="returnToPreviousLocation"
      >
        <carbon-undo aria-hidden="true" />
      </button>
    </div>
    <nav class="tulip-section-links" aria-label="Deck sections">
      <button
        v-for="section in visibleSections"
        :key="`${section.page}-${section.label}`"
        class="tulip-section-link"
        :class="{ active: activeSectionPage === section.page }"
        type="button"
        :title="section.label"
        :aria-current="activeSectionPage === section.page ? 'page' : undefined"
        @click="$nav.go(section.page)"
      >
        {{ section.label }}
      </button>
    </nav>
    <span class="tulip-page-position">{{ nav.currentPage }} / {{ nav.total }}</span>
    <div class="tulip-progress" aria-hidden="true">
      <div class="tulip-progress-bar" :style="{ width: progressWidth }" />
    </div>
  </footer>
</template>

<style scoped>
.tulip-bottom-shell {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--tulip-shell-bottom-height);
  box-sizing: border-box;
  z-index: 60;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
  padding: 0.52rem var(--tulip-shell-x) 0.38rem;
  background: var(--tulip-shell-bottom);
  color: color-mix(in srgb, var(--tulip-shell-ink) 86%, transparent);
  font-family: var(--tulip-reference-serif);
  font-size: var(--tulip-caption-size);
  line-height: 1;
}

.tulip-footer-leading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.85rem;
}

.tulip-footer-wordmark-link {
  display: flex;
  align-items: center;
  width: 13.5rem;
  height: 2rem;
  flex: 0 0 auto;
  border-radius: 0.25rem;
  line-height: 0;
}

.tulip-footer-wordmark-link:focus-visible {
  outline: 2px solid var(--tulip-shell-ink);
  outline-offset: 2px;
}

.tulip-footer-wordmark {
  display: block;
  width: 13.5rem;
  height: auto;
  max-height: 1.9rem;
  object-fit: contain;
}

.tulip-history-back {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 1.75rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--tulip-shell-ink) 18%, transparent);
  border-radius: 50%;
  padding: 0;
  background: transparent;
  color: color-mix(in srgb, var(--tulip-shell-ink) 62%, transparent);
  cursor: pointer;
}

.tulip-history-back svg {
  width: 1.05rem;
  height: 1.05rem;
}

.tulip-history-back:hover:not(:disabled),
.tulip-history-back:focus-visible {
  border-color: color-mix(in srgb, var(--tulip-shell-ink) 42%, transparent);
  background: color-mix(in srgb, white 24%, transparent);
  color: var(--tulip-shell-ink);
}

.tulip-history-back:focus-visible {
  outline: 2px solid var(--tulip-shell-ink);
  outline-offset: 2px;
}

.tulip-history-back:disabled {
  cursor: default;
  opacity: 0.32;
}

.tulip-section-links {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 0.38rem;
  min-width: 0;
  overflow: hidden;
}

.tulip-section-link {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0.16rem;
  padding: 0.28rem 0 0.25rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.66;
  cursor: pointer;
}

.tulip-section-link:hover,
.tulip-section-link:focus-visible {
  opacity: 1;
  text-decoration: underline;
}

.tulip-section-link:focus-visible {
  outline: 2px solid var(--tulip-shell-ink);
  outline-offset: 2px;
}

.tulip-section-link.active {
  color: var(--tulip-shell-ink);
  font-weight: 800;
  opacity: 1;
  text-decoration: underline;
  text-decoration-thickness: 0.13rem;
  text-underline-offset: 0.18rem;
}

.tulip-page-position {
  justify-self: end;
  padding-left: 0.75rem;
  color: var(--tulip-shell-ink);
  white-space: nowrap;
}

.tulip-progress {
  position: absolute;
  top: 0;
  right: var(--tulip-shell-x);
  left: var(--tulip-shell-x);
  height: 2px;
  background: color-mix(in srgb, var(--tulip-shell-ink) 18%, transparent);
}

.tulip-progress-bar {
  height: 100%;
  background: var(--tulip-shell-ink);
}

@media (max-width: 720px) {
  .tulip-bottom-shell {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .tulip-section-links {
    display: none;
  }
}
</style>

<style>
.slidev-slide-container div.opacity-0.p-2.absolute.bottom-0 {
  display: none !important;
}
</style>
