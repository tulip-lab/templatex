<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import defaultLogo from '../assets/tulip-logo.png'
import { asText, resolvePublicAssetPath } from '../utils/config'

const { $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const title = computed(() => asText(config.value.contactTitle, 'Stay Connected'))
const author = computed(() => asText(config.value.author, 'Professor Gang Li'))
const affiliation = computed(() => asText(config.value.contactAffiliation, asText(config.value.affiliation, 'Deakin University, Australia')))
const organisation = computed(() => asText(config.value.contactOrganisation, 'School of Information Technology'))
const email = computed(() => asText(config.value.email, 'director@tulip.academy'))
const website = computed(() => asText(config.value.website, 'https://www.tulip.academy'))
const github = computed(() => asText(config.value.github, 'https://github.com/tulip-lab'))
const scholar = computed(() => asText(config.value.scholar, 'https://scholar.google.com/citations?user=dqwjm-0AAAAJ&hl=en'))
const githubLabel = computed(() => asText(config.value.githubLabel, 'tulip-lab'))
const scholarLabel = computed(() => asText(config.value.scholarLabel, 'Google Scholar'))
const websiteLabel = computed(() => asText(config.value.websiteLabel, 'tulip.academy'))
const logo = computed(() => {
  const configured = asText(config.value.contactLogo)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultLogo
})
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="contact-wrap">
      <h1>{{ title }}</h1>
      <div class="business-card">
        <div class="card-logo-wrap">
          <img :src="logo" alt="TULIP Lab logo">
        </div>
        <div class="card-details">
          <p class="card-name">{{ author }}</p>
          <p class="card-org">{{ organisation }}<br>{{ affiliation }}</p>
          <div class="card-divider" />
          <div class="card-grid">
            <p>Email: <a :href="`mailto:${email}`">{{ email }}</a></p>
            <p>GitHub: <a :href="github">{{ githubLabel }}</a></p>
            <p>Scholar: <a :href="scholar">{{ scholarLabel }}</a></p>
            <p>Website: <a :href="website">{{ websiteLabel }}</a></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.contact-wrap {
  position: absolute;
  inset: 12% 5.5% 10.5%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.contact-wrap h1 { margin: 0 0 1.2rem; }
.business-card {
  display: flex;
  width: min(52rem, 100%);
  min-height: 0;
  aspect-ratio: 52 / 19;
  overflow: hidden;
  border: 2px solid #5a5c94;
  border-radius: 0.7rem;
  background: #fff;
  box-shadow: 0 0.5rem 1.5rem rgba(45, 52, 121, 0.16);
}
.card-logo-wrap {
  display: flex;
  width: 28%;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(90, 92, 148, 0.25);
  padding: 1rem;
}
.card-logo-wrap img { width: 9.8rem; max-height: 14rem; object-fit: contain; }
.card-details { display: flex; width: 72%; padding: 1.5rem 2.5rem; flex-direction: column; justify-content: center; }
.card-name { margin: 0; color: var(--pd1); font-size: 1.5rem; font-weight: 700; }
.card-org { margin: 0.35rem 0 0; font-size: 1.03rem; line-height: 1.4; opacity: 0.88; }
.card-divider { border-top: 1px solid rgba(90, 92, 148, 0.35); margin: 1rem 0; }
.card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.6rem; }
.card-grid p { margin: 0; font-size: 0.92rem; }
</style>
