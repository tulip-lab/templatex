<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import defaultLogo from '../assets/tulip-logo.png'
import { asCollaborationRegions, asText, asTextList, resolvePublicAssetPath } from '../utils/config'

interface Props {
  title?: string
  tagline?: string
  intro?: string
  topics?: unknown
  regions?: unknown
  labLogo?: string
}

const props = defineProps<Props>()
const { $clicks } = useSlideContext()
const title = computed(() => asText(props.title, 'Global Collaborations'))
const tagline = computed(() => asText(props.tagline, 'TULIP Lab research network'))
const intro = computed(() => asText(props.intro, 'Long-term academic partnerships connect shared methods, people, and real-world research challenges.'))
const topics = computed(() => {
  const configured = asTextList(props.topics)
  return configured.length
    ? configured
    : ['Artificial Intelligence', 'Business Intelligence', 'Privacy & Security', 'Applied Analytics']
})
const regions = computed(() => asCollaborationRegions(props.regions))
const activeIndex = computed(() => Math.min(Math.max($clicks.value, 0), Math.max(regions.value.length - 1, 0)))
const activeRegion = computed(() => regions.value[activeIndex.value])
const labLogo = computed(() => {
  const configured = asText(props.labLogo)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultLogo
})
const resolvePhoto = (src: string) => resolvePublicAssetPath(src, import.meta.env.BASE_URL)
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="collaborations-grid">
      <section class="collaboration-context">
        <img class="lab-logo" :src="labLogo" alt="TULIP Lab logo">
        <p class="eyebrow">{{ tagline }}</p>
        <h1>{{ title }}</h1>
        <p class="intro">{{ intro }}</p>

        <div class="topic-list" aria-label="Research themes">
          <span v-for="topic in topics" :key="topic">{{ topic }}</span>
        </div>
      </section>

      <section v-if="activeRegion" class="region-stage" aria-live="polite">
        <nav
          class="region-tabs"
          aria-label="Collaboration regions"
          :style="{ gridTemplateColumns: `repeat(${regions.length}, minmax(0, 1fr))` }"
        >
          <span
            v-for="(region, index) in regions"
            :key="region.name"
            :class="{ 'region-tab--active': index === activeIndex }"
          >
            {{ region.name }}
          </span>
        </nav>

        <Transition name="region-shift" mode="out-in">
          <div :key="activeRegion.name" class="region-content">
            <header class="region-header">
              <div>
                <p v-if="activeRegion.label" class="region-label">{{ activeRegion.label }}</p>
                <h2>{{ activeRegion.name }}</h2>
              </div>
              <strong>
                {{ activeRegion.institutions.length }}
                {{ activeRegion.institutions.length === 1 ? 'institution' : 'institutions' }}
              </strong>
            </header>

            <div
              v-if="activeRegion.photos.length"
              class="photo-grid"
              :class="{
                'photo-grid--solo': activeRegion.photos.length === 1,
                'photo-grid--trio': activeRegion.photos.length === 3,
                'photo-grid--many': activeRegion.photos.length === 5 && activeRegion.photoLayout !== 'portrait-feature',
                'photo-grid--portrait-feature': activeRegion.photos.length === 5 && activeRegion.photoLayout === 'portrait-feature',
                'photo-grid--six': activeRegion.photos.length >= 6,
              }"
            >
              <figure v-for="photo in activeRegion.photos.slice(0, 6)" :key="photo.src">
                <img
                  :src="resolvePhoto(photo.src)"
                  :alt="photo.alt"
                  :style="{ objectFit: photo.fit ?? 'cover' }"
                >
              </figure>
            </div>

            <ul class="institution-list">
              <li v-for="institution in activeRegion.institutions" :key="institution">
                {{ institution }}
              </li>
            </ul>
          </div>
        </Transition>
      </section>
    </main>
  </div>
</template>

<style scoped>
.collaborations-grid {
  position: absolute;
  inset: 10.5% 5.5% 9.5%;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(17rem, 0.78fr) minmax(0, 1.52fr);
  gap: 2.35rem;
}

.collaboration-context {
  display: flex;
  min-width: 0;
  border-right: 1px solid rgba(90, 92, 148, 0.28);
  padding: 0.4rem 2.2rem 0.4rem 0;
  flex-direction: column;
  justify-content: center;
}

.lab-logo {
  width: 7.2rem;
  height: 5.1rem;
  margin-bottom: 1rem;
  object-fit: contain;
  object-position: left center;
}

.eyebrow,
.region-label {
  margin: 0;
  color: #527f91;
  font-family: var(--tulip-sans);
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0.28rem 0 0;
  font-size: 2.15rem;
  line-height: 1.04;
}

.intro {
  margin: 1rem 0 1.15rem;
  color: rgba(29, 43, 58, 0.76);
  font-size: 0.82rem;
  line-height: 1.48;
}

.topic-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-top: 1px solid rgba(90, 92, 148, 0.22);
}

.topic-list span {
  border-bottom: 1px solid rgba(90, 92, 148, 0.22);
  padding: 0.48rem 0.15rem 0.48rem 0;
  color: var(--pd1);
  font-family: var(--tulip-sans);
  font-size: 0.67rem;
  font-weight: 700;
}

.region-stage {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-rows: 2.15rem minmax(0, 1fr);
}

.region-tabs {
  display: grid;
  align-items: end;
  border-bottom: 1px solid rgba(90, 92, 148, 0.24);
}

.region-tabs span {
  min-width: 0;
  border-bottom: 3px solid transparent;
  padding: 0 0.5rem 0.48rem;
  color: rgba(29, 43, 58, 0.48);
  font-family: var(--tulip-sans);
  font-size: 0.66rem;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
}

.region-tabs .region-tab--active {
  border-bottom-color: var(--tulip-purple);
  color: var(--pd1);
}

.region-content {
  display: grid;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  padding-top: 0.95rem;
}

.region-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.region-header h2 {
  margin: 0.1rem 0 0;
  color: var(--pd1);
  font-size: 1.48rem;
  line-height: 1.05;
}

.region-header strong {
  color: rgba(29, 43, 58, 0.55);
  font-family: var(--tulip-sans);
  font-size: 0.62rem;
  text-transform: uppercase;
}

.photo-grid {
  display: grid;
  min-height: 0;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.45rem;
}

.photo-grid figure {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  margin: 0;
  border-radius: 0.35rem;
  background: #eef1f3;
}

.photo-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-grid--trio figure:first-child {
  grid-row: 1 / 3;
}

.photo-grid--many {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.photo-grid--many figure:nth-child(1),
.photo-grid--many figure:nth-child(2),
.photo-grid--many figure:nth-child(5) {
  grid-column: span 2;
}

.photo-grid--portrait-feature {
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
}

.photo-grid--portrait-feature figure:first-child {
  grid-row: 1 / 3;
}

.photo-grid--six {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.photo-grid--solo {
  display: block;
}

.photo-grid--solo figure {
  width: 100%;
  height: 100%;
}

.photo-grid--solo img {
  object-position: center 42%;
}

.institution-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.24rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.institution-list li {
  position: relative;
  min-width: 0;
  padding-left: 0.78rem;
  color: rgba(29, 43, 58, 0.82);
  font-size: 0.66rem;
  line-height: 1.3;
}

.institution-list li::before {
  position: absolute;
  top: 0.42em;
  left: 0;
  width: 0.34rem;
  height: 0.34rem;
  border-radius: 50%;
  background: var(--tulip-purple);
  content: '';
}

.region-shift-enter-active,
.region-shift-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.region-shift-enter-from { opacity: 0; transform: translateX(0.55rem); }
.region-shift-leave-to { opacity: 0; transform: translateX(-0.35rem); }
</style>
