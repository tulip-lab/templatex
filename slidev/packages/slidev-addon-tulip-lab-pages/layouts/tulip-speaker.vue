<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import gangLiPhoto from '../assets/gangli-photo.jpg'
import { asSpeakerServiceSections, asText, asTextList, resolvePublicAssetPath } from '../utils/config'

const { $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const author = computed(() => asText(config.value.author, 'Professor Gang Li'))
const affiliation = computed(() => asText(config.value.affiliation, 'Deakin University, Australia'))
const profileUrl = computed(() => asText(config.value.speakerProfileUrl, 'https://www.tulip.academy/members/gangli/'))
const photo = computed(() => {
  const configured = asText(config.value.speakerPhoto)
  if (configured)
    return resolvePublicAssetPath(configured, import.meta.env.BASE_URL)

  return author.value.includes('Gang Li') ? gangLiPhoto : ''
})
const configuredSections = computed(() => asSpeakerServiceSections(config.value.speakerSections))
const isDefaultGangProfile = computed(() => author.value.includes('Gang Li') && !configuredSections.value.length)
const sections = computed(() => {
  if (configuredSections.value.length)
    return configuredSections.value

  if (author.value.includes('Gang Li')) {
    return [
      {
        title: 'IEEE Technical Leadership',
        items: [
          {
            role: 'Vice Chair',
            organisation: 'IEEE CIS Data Mining & Big Data Analytics Technical Committee',
            term: '2025–2026 · previously 2017–2019',
          },
          {
            role: 'Chair',
            organisation: 'IEEE CIS Task Force on Educational Data Mining',
            term: '2020–2024',
          },
          {
            role: 'Member',
            organisation: 'IEEE SMC Enterprise Information Systems (EIS) and Enterprise Architecture & Engineering (EAE) TCs',
            term: '',
          },
        ],
      },
      {
        title: 'Editorial Board',
        items: [
          { role: 'Moderator', organisation: 'arXiv cs.LG', term: '2026–' },
          { role: 'Editor', organisation: 'Springer CCIS Series', term: '' },
          { role: 'Associate Editor', organisation: 'Cybersecurity · Springer', term: '' },
          { role: 'Associate Editor', organisation: 'Information Technology & Tourism', term: '' },
          { role: 'Editorial Board', organisation: 'Tourism Management · Journal of Travel Research · APJTR', term: '' },
        ],
      },
    ]
  }

  const highlights = asTextList(config.value.speakerHighlights)
  return highlights.length
    ? [{ title: 'Academic Leadership and Service', items: highlights.map(organisation => ({ role: 'Service', organisation, term: '' })) }]
    : []
})
const ieeeItems = computed(() => sections.value.find(section => section.title === 'IEEE Technical Leadership')?.items ?? [])
const editorialItems = computed(() => sections.value.find(section => section.title === 'Editorial Board')?.items ?? [])
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="standard-content">
      <header class="speaker-header">
        <p class="speaker-eyebrow">Academic profile</p>
        <h1>{{ author }}</h1>
        <p class="speaker-affiliation">{{ affiliation }}</p>
      </header>

      <div class="speaker-grid">
        <section v-if="isDefaultGangProfile" class="gang-profile" aria-label="Academic leadership and editorial service">
          <article class="leadership-summary">
            <h2>IEEE Technical Leadership</h2>
            <div v-if="ieeeItems[0]" class="current-leadership">
              <div class="current-role">
                <p class="current-label">Current · 2025–2026</p>
                <h3>{{ ieeeItems[0].role }}</h3>
                <p>{{ ieeeItems[0].organisation }}</p>
              </div>
              <p class="previous-term">Previously<br><strong>2017–2019</strong></p>
            </div>
            <div class="leadership-secondary">
              <div v-for="item in ieeeItems.slice(1)" :key="`${item.role}-${item.organisation}`" class="leadership-item">
                <div class="leadership-meta">
                  <strong>{{ item.role }}</strong>
                  <span v-if="item.term">{{ item.term }}</span>
                </div>
                <p>{{ item.organisation }}</p>
              </div>
            </div>
          </article>

          <article class="editorial-summary">
            <h2>Editorial Board</h2>
            <div class="editorial-columns">
              <section class="editorial-column">
                <p class="column-label">Computer Science</p>
                <div class="editorial-list">
                  <div v-for="item in editorialItems.slice(0, 3)" :key="`${item.role}-${item.organisation}`" class="editorial-item">
                    <strong>{{ item.organisation }}</strong>
                    <span>{{ item.role }}<template v-if="item.term"> · {{ item.term }}</template></span>
                  </div>
                </div>
              </section>
              <section class="editorial-column">
                <p class="column-label">Tourism</p>
                <div class="editorial-list">
                  <div v-for="item in editorialItems.slice(3)" :key="`${item.role}-${item.organisation}`" class="editorial-item">
                    <strong>{{ item.organisation }}</strong>
                    <span>{{ item.role }}</span>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </section>

        <section v-else class="service-sections" aria-label="Academic leadership and editorial service">
          <article v-for="section in sections" :key="section.title" class="service-section">
            <h2>{{ section.title }}</h2>
            <div class="service-items">
              <div v-for="item in section.items" :key="`${item.role}-${item.organisation}`" class="service-item">
                <strong>{{ item.role }}</strong>
                <p>{{ item.organisation }}</p>
                <span v-if="item.term">{{ item.term }}</span>
              </div>
            </div>
          </article>
        </section>

        <aside class="speaker-portrait">
          <a v-if="photo" class="speaker-photo-link" :href="profileUrl" :aria-label="`Open ${author} profile`">
            <img :src="photo" :alt="author" class="speaker-photo">
          </a>
          <div class="portrait-caption">
            <strong>Founder · TULIP Lab</strong>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.standard-content {
  position: absolute;
  inset: 10.5% 5.5% 9.5%;
  z-index: 1;
}

.speaker-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: end;
  column-gap: 1rem;
}

.speaker-eyebrow {
  grid-column: 1 / -1;
  margin: 0 0 0.22rem;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 800;
  text-transform: uppercase;
}

.speaker-header h1 {
  margin: 0;
  font-size: 2.45rem;
  line-height: 1;
}

.speaker-affiliation {
  margin: 0 0 0.25rem;
  color: rgba(29, 43, 58, 0.62);
  font-family: var(--tulip-sans);
  font-size: 0.72rem;
  font-weight: 750;
  text-transform: uppercase;
}

.speaker-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.34fr) minmax(16rem, 0.66fr);
  gap: 2.15rem;
  margin-top: 2.35rem;
  align-items: start;
}

.gang-profile {
  display: grid;
  gap: 1.25rem;
  min-width: 0;
}

.gang-profile h2 {
  margin: 0 0 0.62rem;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-serif);
  font-size: 1.08rem;
  line-height: 1.1;
}

.leadership-summary,
.editorial-summary {
  border-top: 1px solid var(--tulip-block-rule);
  padding-top: 0.68rem;
}

.current-leadership {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  border-left: 4px solid var(--tulip-purple);
  padding: 0.7rem 0.78rem 0.74rem;
  background: var(--tulip-block-surface-soft);
}

.current-label {
  margin: 0 0 0.12rem;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.current-role h3 {
  margin: 0;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: 0.76rem;
  font-weight: 850;
  line-height: 1.15;
  text-transform: uppercase;
}

.current-role > p:last-child {
  margin: 0.18rem 0 0;
  color: rgba(29, 43, 58, 0.82);
  font-size: 0.7rem;
  line-height: 1.25;
}

.previous-term {
  min-width: 4.6rem;
  margin: 0;
  color: rgba(29, 43, 58, 0.48);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 700;
  line-height: 1.28;
  text-align: right;
  text-transform: uppercase;
}

.previous-term strong {
  color: var(--tulip-purple-dark);
  font-size: var(--tulip-caption-size);
}

.leadership-secondary {
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 1rem;
  margin-top: 0.72rem;
}

.leadership-item {
  min-width: 0;
  border-top: 1px solid var(--tulip-block-rule);
  padding-top: 0.52rem;
}

.leadership-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.leadership-meta strong {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 850;
  text-transform: uppercase;
}

.leadership-meta span {
  color: rgba(29, 43, 58, 0.48);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 700;
  white-space: nowrap;
}

.leadership-item > p {
  margin: 0.18rem 0 0;
  color: rgba(29, 43, 58, 0.84);
  font-size: var(--tulip-small-size);
  line-height: 1.27;
}

.editorial-columns {
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 1.25rem;
  min-width: 0;
}

.editorial-column {
  min-width: 0;
}

.editorial-column + .editorial-column {
  border-left: 1px solid var(--tulip-block-rule);
  padding-left: 1.15rem;
}

.column-label {
  margin: 0 0 0.36rem;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.editorial-list {
  display: grid;
}

.editorial-item {
  display: grid;
  gap: 0.06rem;
  border-top: 1px solid var(--tulip-block-rule);
  padding: 0.38rem 0 0.35rem;
}

.editorial-item strong {
  color: rgba(29, 43, 58, 0.9);
  font-size: var(--tulip-small-size);
  font-weight: 700;
  line-height: 1.22;
}

.editorial-item span {
  color: rgba(29, 43, 58, 0.5);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 750;
  line-height: 1.2;
  text-transform: uppercase;
}

.service-sections {
  display: grid;
  align-content: center;
  gap: 1.05rem;
  min-width: 0;
}

.service-section {
  display: grid;
  grid-template-columns: 8.3rem minmax(0, 1fr);
  gap: 1rem;
  border-top: 1px solid var(--tulip-block-rule);
  padding-top: 0.78rem;
}

.service-section h2 {
  margin: 0;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-serif);
  font-size: 1.02rem;
  line-height: 1.12;
}

.service-items {
  display: grid;
  gap: 0.48rem;
}

.service-item {
  display: grid;
  grid-template-columns: 5.55rem minmax(0, 1fr) minmax(0, auto);
  gap: 0.55rem;
  align-items: baseline;
  min-width: 0;
}

.service-item strong {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 850;
  line-height: 1.25;
  text-transform: uppercase;
}

.service-item p {
  margin: 0;
  color: rgba(29, 43, 58, 0.9);
  font-size: 0.72rem;
  line-height: 1.3;
}

.service-item span {
  color: rgba(29, 43, 58, 0.52);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 700;
  line-height: 1.25;
  text-align: right;
  white-space: nowrap;
}

.speaker-portrait {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
}

.speaker-photo-link {
  display: block;
  overflow: hidden;
  border-radius: 0.55rem;
  background: var(--tulip-block-surface-subtle);
  box-shadow: var(--tulip-shadow-raised);
}

.speaker-photo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 653 / 900;
  object-fit: contain;
}

.portrait-caption {
  position: relative;
  margin-top: 0.72rem;
  padding-top: 0.58rem;
  text-align: center;
}

.portrait-caption::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2.35rem;
  height: 3px;
  border-radius: 999px;
  background: var(--tulip-purple);
  content: '';
  transform: translateX(-50%);
}

.portrait-caption strong {
  color: var(--pd1);
  font-size: 0.76rem;
}

.portrait-caption span {
  color: rgba(29, 43, 58, 0.56);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 750;
  text-transform: uppercase;
}
</style>
