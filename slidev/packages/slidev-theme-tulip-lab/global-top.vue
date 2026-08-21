<script setup lang="ts">
import { computed } from 'vue'
import { useDeckNavigation } from './composables/useDeckNavigation'
import { getShellVisibility } from './utils/deckNavigation'
import logo from './assets/tulip-logo.png'

const {
  nav,
  currentSection,
  currentSession,
  currentSessionIndex,
} = useDeckNavigation()

const navigationMode = computed(() => {
  const value = nav.currentSlideRoute.value.meta.slide?.frontmatter?.navigation
  return typeof value === 'string' ? value : undefined
})
const navigationLabel = computed(() => {
  const value = nav.currentSlideRoute.value.meta.slide?.frontmatter?.navigationLabel
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
})
const visibility = computed(() => getShellVisibility(
  nav.currentLayout.value,
  navigationMode.value,
  Boolean(currentSection.value || navigationLabel.value),
))
const locationLabel = computed(() => {
  if (navigationLabel.value)
    return navigationLabel.value

  const section = currentSection.value
  if (!section)
    return ''
  if (currentSession.value)
    return `${currentSession.value.code} · ${currentSession.value.title}`
  if (section.block)
    return `${section.block} · ${section.label}`
  return section.label
})
const showSessionNodes = computed(() => (
  visibility.value.showLocation
  && (currentSection.value?.sessions.length ?? 0) > 1
))
</script>

<template>
  <header
    v-if="visibility.showLocation || visibility.showLogo"
    class="tulip-top-shell"
    aria-label="Slide location and TULIP Lab brand"
  >
    <div v-if="visibility.showLocation" class="tulip-location">
      <button
        class="tulip-location-current"
        type="button"
        :title="locationLabel"
        @click="$nav.go(currentSession?.page ?? currentSection?.page ?? 1)"
      >
        {{ locationLabel }}
      </button>
      <nav v-if="showSessionNodes" class="tulip-session-nodes" aria-label="Sessions in this section">
        <button
          v-for="(session, index) in currentSection?.sessions"
          :key="session.code"
          class="tulip-session-node"
          :class="{ active: currentSessionIndex === index }"
          type="button"
          :title="`${session.code} · ${session.title}`"
          :aria-label="`Go to ${session.code} · ${session.title}`"
          :aria-current="currentSessionIndex === index ? 'step' : undefined"
          @click="$nav.go(session.page)"
        />
        <span class="tulip-session-position">
          {{ currentSessionIndex >= 0
            ? `${currentSessionIndex + 1} of ${currentSection?.sessions.length}`
            : `${currentSection?.sessions.length} sessions` }}
        </span>
      </nav>
    </div>
    <button
      v-if="visibility.showLogo"
      class="tulip-corner-logo-link"
      type="button"
      aria-label="Return to cover"
      title="Return to cover"
      @click="$nav.go(1)"
    >
      <img :src="logo" class="tulip-corner-logo" alt="" aria-hidden="true">
    </button>
  </header>
</template>

<style scoped>
.tulip-top-shell {
  position: absolute;
  top: 2.4%;
  left: var(--tulip-shell-x, 5.5%);
  right: var(--tulip-shell-x, 5.5%);
  z-index: 60;
  display: flex;
  align-items: center;
  min-height: 2.05rem;
  font-family: var(--tulip-reference-serif);
}

.tulip-location {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.tulip-location-current {
  max-width: 31rem;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  padding: 0.28rem 0.72rem;
  background: color-mix(in srgb, var(--tulip-shell-ink) 10%, transparent);
  color: var(--tulip-shell-ink);
  font: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.tulip-location-current:hover {
  background: color-mix(in srgb, var(--tulip-shell-ink) 17%, transparent);
}

.tulip-session-nodes {
  display: flex;
  align-items: center;
  gap: 0.42rem;
  min-width: 0;
}

.tulip-session-node {
  width: 0.48rem;
  height: 0.48rem;
  flex: 0 0 0.48rem;
  border: 0;
  border-radius: 50%;
  padding: 0;
  background: color-mix(in srgb, var(--tulip-shell-ink) 26%, transparent);
  cursor: pointer;
}

.tulip-session-node:hover,
.tulip-session-node.active {
  background: var(--tulip-shell-ink);
  transform: scale(1.18);
}

.tulip-session-position {
  margin-left: 0.2rem;
  color: color-mix(in srgb, var(--tulip-shell-ink) 62%, transparent);
  font-size: 0.58rem;
  white-space: nowrap;
}

.tulip-corner-logo-link {
  display: grid;
  place-items: center;
  margin-left: auto;
  border: 0;
  border-radius: 0.35rem;
  padding: 0.1rem;
  background: transparent;
  cursor: pointer;
}

.tulip-corner-logo-link:hover,
.tulip-corner-logo-link:focus-visible {
  background: color-mix(in srgb, var(--tulip-shell-ink) 10%, transparent);
}

.tulip-corner-logo-link:focus-visible {
  outline: 2px solid var(--tulip-shell-ink);
  outline-offset: 2px;
}

.tulip-corner-logo {
  width: auto;
  height: 2.05rem;
  object-fit: contain;
}
</style>
