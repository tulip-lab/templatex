<script setup lang="ts">
import { computed } from 'vue'
import { useDeckNavigation } from './composables/useDeckNavigation'
import wordmark from './assets/tulip-wordmark.png'
import {
  formatSectionLabel,
  getProgressPercentage,
  getShellVisibility,
} from './utils/deckNavigation'

const { nav, sections, currentSectionIndex, currentSection } = useDeckNavigation()

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
</script>

<template>
  <footer v-if="visibility.showBottom" class="tulip-bottom-shell">
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
    <nav class="tulip-section-links" aria-label="Deck sections">
      <button
        v-for="(section, index) in sections"
        :key="`${section.page}-${section.label}`"
        class="tulip-section-link"
        :class="{ active: currentSectionIndex === index }"
        type="button"
        :aria-current="currentSectionIndex === index ? 'page' : undefined"
        @click="$nav.go(section.page)"
      >
        {{ formatSectionLabel(section) }}
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
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.52rem var(--tulip-shell-x) 0.38rem;
  background: var(--tulip-shell-bottom);
  color: color-mix(in srgb, var(--tulip-shell-ink) 86%, transparent);
  font-family: var(--tulip-reference-serif);
  font-size: 0.62rem;
  line-height: 1;
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

.tulip-section-links {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  min-width: 0;
  overflow: hidden;
}

.tulip-section-link {
  overflow: hidden;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.66;
  cursor: pointer;
}

.tulip-section-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.tulip-section-link.active {
  color: var(--tulip-shell-ink);
  font-weight: 700;
  opacity: 1;
}

.tulip-page-position {
  margin-left: auto;
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
</style>

<style>
.slidev-slide-container div.opacity-0.p-2.absolute.bottom-0 {
  display: none !important;
}
</style>
