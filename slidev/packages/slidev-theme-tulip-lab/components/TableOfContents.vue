<script setup lang="ts">
import { computed } from 'vue'
import { useDeckNavigation } from '../composables/useDeckNavigation'
import { splitSectionsForToc, visibleDeckSections } from '../utils/deckNavigation'

const { sections } = useDeckNavigation()

const columns = computed(() => {
  const [left, right] = splitSectionsForToc(visibleDeckSections(sections.value))
  return [
    { id: 'left', sections: left },
    { id: 'right', sections: right },
  ].filter(column => column.sections.length > 0)
})
</script>

<template>
  <div class="tulip-toc-shell">
    <h1 class="tulip-toc-title">Table of Contents</h1>
    <div class="tulip-toc-columns">
      <section
        v-for="column in columns"
        :key="column.id"
        class="tulip-toc-column"
        aria-label="Deck sections"
      >
        <div v-for="section in column.sections" :key="`${section.page}-${section.label}`" class="tulip-toc-group">
          <button class="tulip-toc-section" type="button" @click="$nav.go(section.page)">
            <span v-if="section.block" class="tulip-toc-number">{{ section.block }}</span>
            <span class="tulip-toc-label">{{ section.label }}</span>
          </button>
          <div v-if="section.tocExpand && section.sessions.length" class="tulip-toc-sessions">
            <button
              v-for="session in section.sessions"
              :key="session.code"
              class="tulip-toc-session"
              type="button"
              @click="$nav.go(session.page)"
            >
              <strong :class="{ 'tulip-toc-session-label': session.title === session.code }">{{ session.code }}</strong>
              <span v-if="session.title !== session.code">{{ session.title }}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tulip-toc-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  padding-top: 0.2rem;
}

.tulip-toc-title {
  margin-bottom: 0.5rem;
}

.tulip-toc-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.8rem;
  min-height: 0;
}

.tulip-toc-column {
  min-width: 0;
}

.tulip-toc-group {
  margin-bottom: 0.16rem;
}

.tulip-toc-section {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.62rem;
  border: 0;
  border-radius: var(--tulip-radius);
  padding: 0.36rem 0.62rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.tulip-toc-section:hover,
.tulip-toc-section:focus-visible {
  background: var(--tulip-block-surface-soft);
}

.tulip-toc-section:focus-visible,
.tulip-toc-session:focus-visible {
  outline: 2px solid var(--tulip-purple-dark);
  outline-offset: 2px;
}

.tulip-toc-number {
  display: grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  flex: 0 0 1.6rem;
  border-radius: 50%;
  background: var(--tulip-block-surface-soft);
  color: var(--tulip-purple-dark);
  font-size: var(--tulip-label-size);
  font-weight: 700;
}

.tulip-toc-label {
  font-size: 0.96rem;
  font-weight: 700;
}

.tulip-toc-sessions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.26rem 0.48rem;
  margin: 0.14rem 0 0.38rem 2.22rem;
}

.tulip-toc-session {
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.3rem;
  border: 0;
  border-radius: 0.35rem;
  padding: 0.3rem 0.42rem;
  background: var(--tulip-block-surface-subtle);
  color: inherit;
  font: inherit;
  font-size: var(--tulip-label-size);
  text-align: left;
  cursor: pointer;
}

.tulip-toc-session:hover,
.tulip-toc-session:focus-visible {
  background: var(--tulip-block-surface-soft);
}

.tulip-toc-session strong {
  color: var(--tulip-purple-dark);
}

.tulip-toc-session-label {
  grid-column: 1 / -1;
}
</style>
