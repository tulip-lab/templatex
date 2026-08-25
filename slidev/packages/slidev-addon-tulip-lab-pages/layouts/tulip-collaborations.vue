<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import QrcodeVue from 'qrcode.vue'
import { computed, ref } from 'vue'
import defaultLogo from '../assets/tulip-logo.png'
import { asCollaborationRegions, asResearchAreaList, asText, asTextList, resolvePublicAssetPath } from '../utils/config'

interface Props {
  title?: string
  heading?: string
  tagline?: string
  intro?: string
  topics?: unknown
  regions?: unknown
  labLogo?: string
  includeResearch?: boolean
  researchTitle?: string
  researchIntro?: string
  researchAreas?: unknown
  homeQr?: string
  homeCta?: string
}

const props = defineProps<Props>()
const { $clicks, $renderContext, $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const exportRoute = computed(() => typeof window !== 'undefined' && /\/export(?:\/|$)/.test(window.location.pathname))
const interactive = computed(() => !exportRoute.value && ['slide', 'presenter'].includes($renderContext.value))
const title = computed(() => asText(props.heading, asText(props.title, 'Global Collaborations')))
const tagline = computed(() => asText(props.tagline, 'TULIP Lab research network'))
const intro = computed(() => asText(props.intro, 'Long-term academic partnerships connect shared methods, people, and real-world research challenges.'))
const topics = computed(() => {
  const configured = asTextList(props.topics)
  return configured.length
    ? configured
    : ['Artificial Intelligence', 'Business Intelligence', 'Privacy & Security', 'Applied Analytics']
})
const regions = computed(() => asCollaborationRegions(props.regions))
const includeResearch = computed(() => props.includeResearch === true)
const researchTitle = computed(() => asText(props.researchTitle, 'Research Framework'))
const researchIntro = computed(() => asText(props.researchIntro, 'Four connected capabilities move from intelligent methods to responsible, real-world impact.'))
const researchAreas = computed(() => {
  const configured = asResearchAreaList(props.researchAreas)
  const globalConfigured = asResearchAreaList(config.value.academyResearchAreas)
  if (configured.length)
    return configured
  if (globalConfigured.length)
    return globalConfigured
  return [
    { title: 'Artificial Intelligence', description: 'Develop learning and reasoning methods for complex intelligent tasks.' },
    { title: 'Business Intelligence', description: 'Turn organisational data into evidence for forecasting and decisions.' },
    { title: 'Privacy & Security', description: 'Strengthen cyber security while preserving privacy throughout analysis.' },
    { title: 'Applied Analytics', description: 'Translate AI and data science into practical research and industry outcomes.' },
  ]
})
const stateCount = computed(() => regions.value.length + (includeResearch.value ? 1 : 0))
const activeIndex = computed(() => Math.min(Math.max($clicks.value, 0), Math.max(stateCount.value - 1, 0)))
const isResearchState = computed(() => includeResearch.value && activeIndex.value === 0)
const activeRegionIndex = computed(() => activeIndex.value - (includeResearch.value ? 1 : 0))
const activeRegion = computed(() => regions.value[activeRegionIndex.value])
const stateTabs = computed(() => [
  ...(includeResearch.value ? [{ name: 'Framework', label: researchTitle.value }] : []),
  ...regions.value.map(region => ({ name: region.name, label: region.name })),
])
const labLogo = computed(() => {
  const configured = asText(props.labLogo)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultLogo
})
const homeUrl = computed(() => asText(config.value.website, 'https://www.tulip.academy'))
const homeLabel = computed(() => asText(config.value.websiteLabel, 'tulip.academy'))
const homeCta = computed(() => asText(props.homeCta, 'Explore TULIP Lab'))
const homeQr = computed(() => {
  const configured = asText(props.homeQr)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : ''
})
const homeQrFailed = ref(false)
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

      <section class="network-stage" aria-live="polite">
        <Transition name="region-shift" mode="out-in">
          <div v-if="!interactive && includeResearch" key="print" class="print-network-summary">
            <section>
              <header class="framework-header">
                <p>Research</p>
                <h2>{{ researchTitle }}</h2>
              </header>
              <div class="print-research-list">
                <article v-for="area in researchAreas" :key="area.title">
                  <strong>{{ area.title }}</strong>
                  <p>{{ area.description }}</p>
                </article>
              </div>
            </section>
            <section class="print-region-summary">
              <header class="framework-header">
                <p>Network</p>
                <h2>Global Collaborations</h2>
              </header>
              <article v-for="region in regions" :key="region.name">
                <div><strong>{{ region.name }}</strong><span>{{ region.label }}</span></div>
                <p>{{ region.institutions.join(' · ') }}</p>
              </article>
            </section>
          </div>

          <div v-else-if="isResearchState" key="framework" class="framework-content">
            <header class="framework-header">
              <p>Research</p>
              <h2>{{ researchTitle }}</h2>
              <span>{{ researchIntro }}</span>
            </header>

            <div class="framework-areas">
              <article v-for="(area, index) in researchAreas" :key="area.title">
                <span>0{{ index + 1 }}</span>
                <strong>{{ area.title }}</strong>
                <p>{{ area.description }}</p>
              </article>
            </div>

            <p class="framework-note"><strong>One lab, connected capabilities:</strong> methods, evidence, safeguards, and applications develop together.</p>
          </div>

          <div v-else-if="activeRegion" :key="activeRegion.name" class="region-content">
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

        <nav
          class="state-tabs"
          aria-label="TULIP Lab research and collaboration states"
          :style="{ gridTemplateColumns: `repeat(${stateTabs.length}, minmax(0, 1fr))` }"
        >
          <span
            v-for="(state, index) in stateTabs"
            :key="state.name"
            :class="{ 'state-tab--active': interactive ? index === activeIndex : true }"
          >
            {{ state.label }}
          </span>
        </nav>
      </section>
    </main>

    <a
      class="tulip-home-card"
      :href="homeUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`${homeCta} at ${homeLabel}`"
    >
      <img
        v-if="homeQr && !homeQrFailed"
        class="tulip-home-qr"
        :src="homeQr"
        alt="QR code for the TULIP Lab homepage"
        @error="homeQrFailed = true"
      >
      <QrcodeVue
        v-else
        class="tulip-home-qr"
        :value="homeUrl"
        :size="94"
        :margin="1"
        level="M"
        render-as="svg"
        foreground="#1d2b3a"
        aria-label="QR code for the TULIP Lab homepage"
      />
      <span>
        <small>OUR RESEARCH COMMUNITY</small>
        <strong>{{ homeCta }}</strong>
        <em>{{ homeLabel }}</em>
      </span>
    </a>
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
  border-right: 1px solid var(--tulip-block-rule);
  padding: 0.4rem 2.2rem 0.4rem 0;
  flex-direction: column;
  justify-content: center;
}

.tulip-home-card {
  position: absolute;
  bottom: calc(9.5% + 1rem);
  left: 5.5%;
  z-index: 3;
  display: grid;
  width: 21rem;
  grid-template-columns: 4.7rem minmax(0, 1fr);
  gap: 0.72rem;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid var(--tulip-block-rule);
  border-left: 4px solid var(--tulip-purple);
  border-radius: 0 var(--tulip-radius) var(--tulip-radius) 0;
  background: var(--tulip-block-surface-soft);
  padding: 0.5rem 0.7rem 0.5rem 0.55rem;
  color: var(--pd1);
  font-family: var(--tulip-serif);
  box-shadow: var(--tulip-shadow);
  text-decoration: none;
}

.tulip-home-qr {
  display: block;
  width: 4.7rem;
  height: 4.7rem;
  border-radius: 0.22rem;
  background: white;
}

.tulip-home-card span {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.14rem;
}

.tulip-home-card small,
.tulip-home-card em {
  color: var(--tulip-text-muted);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-style: normal;
  line-height: 1.2;
}

.tulip-home-card small {
  font-weight: 800;
}

.tulip-home-card strong {
  font-size: var(--tulip-body-size);
  line-height: 1.2;
}

.lab-logo {
  width: 7.2rem;
  height: 5.1rem;
  margin-bottom: 1rem;
  object-fit: contain;
  object-position: left center;
}

.eyebrow,
.region-label,
.framework-header > p {
  margin: 0;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
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
  border-top: 1px solid var(--tulip-block-rule);
}

.topic-list span {
  border-bottom: 1px solid var(--tulip-block-rule);
  padding: 0.48rem 0.15rem 0.48rem 0;
  color: var(--pd1);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 700;
}

.network-stage {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr) 2.15rem;
}

.state-tabs {
  display: grid;
  align-items: start;
  border-top: 1px solid var(--tulip-block-rule);
}

.state-tabs span {
  min-width: 0;
  border-top: 3px solid transparent;
  margin-top: -1px;
  padding: 0.48rem 0.38rem 0;
  color: rgba(29, 43, 58, 0.48);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 800;
  line-height: 1.16;
  text-align: center;
  text-transform: uppercase;
}

.state-tabs .state-tab--active {
  border-top-color: var(--tulip-purple);
  color: var(--pd1);
}

.framework-content,
.region-content {
  display: grid;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  padding: 0.2rem 0 0.78rem;
}

.framework-header h2,
.region-header h2 {
  margin: 0.1rem 0 0;
  color: var(--pd1);
  font-size: 1.48rem;
  line-height: 1.05;
}

.framework-header > span {
  display: block;
  margin-top: 0.4rem;
  color: rgba(29, 43, 58, 0.62);
  font-size: 0.7rem;
  line-height: 1.35;
}

.framework-areas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem 1.15rem;
  align-content: center;
}

.framework-areas article {
  position: relative;
  min-height: 7.35rem;
  border-top: 3px solid var(--tulip-purple);
  padding: 0.82rem 0.15rem 0;
}

.framework-areas article > span {
  position: absolute;
  top: 0.78rem;
  right: 0.15rem;
  color: rgba(112, 91, 158, 0.34);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 850;
}

.framework-areas strong {
  color: var(--pd1);
  font-size: 0.92rem;
}

.framework-areas p {
  margin: 0.42rem 0 0;
  color: rgba(29, 43, 58, 0.75);
  font-size: 0.7rem;
  line-height: 1.4;
}

.framework-note {
  border-left: 3px solid var(--tulip-purple);
  margin: 0;
  padding: 0.5rem 0.7rem;
  background: var(--tulip-block-surface-soft);
  color: rgba(29, 43, 58, 0.8);
  font-size: var(--tulip-label-size);
  line-height: 1.3;
}

.region-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.region-header > strong {
  color: rgba(29, 43, 58, 0.55);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
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
  background: var(--tulip-block-surface-subtle);
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
  font-size: var(--tulip-caption-size);
  line-height: 1.25;
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

.print-network-summary {
  display: grid;
  min-height: 0;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 1.2rem;
  padding: 0.2rem 0 0.8rem;
  align-items: center;
}

.print-region-summary {
  border-left: 1px solid var(--tulip-block-rule);
  padding-left: 1.2rem;
}

.print-research-list,
.print-region-summary {
  display: grid;
  gap: 0.55rem;
}

.print-research-list {
  margin-top: 0.85rem;
}

.print-research-list article,
.print-region-summary > article {
  border-top: 2px solid var(--tulip-block-rule-strong);
  padding-top: 0.42rem;
}

.print-research-list strong,
.print-region-summary strong {
  color: var(--pd1);
  font-size: var(--tulip-label-size);
}

.print-research-list p,
.print-region-summary p {
  margin: 0.2rem 0 0;
  color: rgba(29, 43, 58, 0.7);
  font-size: var(--tulip-caption-size);
  line-height: 1.3;
}

.print-region-summary > article > div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.print-region-summary span {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 800;
  text-transform: uppercase;
}

.region-shift-enter-active,
.region-shift-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.region-shift-enter-from { opacity: 0; transform: translateX(0.55rem); }
.region-shift-leave-to { opacity: 0; transform: translateX(-0.35rem); }
</style>
