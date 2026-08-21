<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import gangLiPhoto from '../assets/gangli-photo.jpg'
import { asText, asTextList, resolvePublicAssetPath } from '../utils/config'

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
const highlights = computed(() => {
  const configured = asTextList(config.value.speakerHighlights)
  return configured.length
    ? configured
    : [
        'University Thesis Examination Committee',
        'Researcher Development Director, Deakin Cyber',
        'IEEE technical leadership in data mining, analytics, and enterprise systems',
        'Editorial service across tourism, technology, and cyber security venues',
      ]
})
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="standard-content">
      <header>
        <h1>{{ author }}</h1>
        <p>{{ affiliation }}</p>
      </header>

      <div class="speaker-grid">
        <section class="speaker-copy">
          <p class="speaker-kicker">Academic leadership and service</p>
          <ul>
            <li v-for="highlight in highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </section>

        <a v-if="photo" class="speaker-photo-link" :href="profileUrl" :aria-label="`Open ${author} profile`">
          <img :src="photo" :alt="author" class="speaker-photo">
        </a>
      </div>
    </main>
  </div>
</template>

<style scoped>
.standard-content {
  position: absolute;
  inset: 12% 5.5% 10.5%;
  z-index: 1;
}

header h1 {
  margin: 0;
}

header p {
  margin: 0.2rem 0 0;
  color: rgba(60, 60, 60, 0.62);
  font-family: var(--tulip-sans);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.speaker-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(16rem, 0.85fr);
  gap: 3rem;
  height: calc(100% - 5rem);
  margin-top: 1.25rem;
  align-items: center;
}

.speaker-copy {
  border-left: 4px solid var(--tulip-purple);
  padding: 0.7rem 1.8rem;
}

.speaker-kicker {
  margin: 0 0 1.1rem;
  color: var(--pd1);
  font-family: var(--tulip-serif);
  font-size: 1.25rem;
  font-weight: 700;
}

.speaker-copy ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.94rem;
  line-height: 1.45;
}

.speaker-copy li + li {
  margin-top: 0.72rem;
}

.speaker-photo-link {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.speaker-photo {
  width: min(17.5rem, 100%);
  max-height: 22rem;
  border-radius: 0.45rem;
  object-fit: cover;
  box-shadow: 0 0.5rem 1.5rem rgba(45, 52, 121, 0.16);
}
</style>
