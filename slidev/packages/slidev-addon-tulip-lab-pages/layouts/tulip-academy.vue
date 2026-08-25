<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import defaultLogo from '../assets/tulip-logo.png'
import { asLinkList, asResearchAreaList, asText, resolvePublicAssetPath } from '../utils/config'

const { $clicks, $renderContext, $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const animateResearchAreas = computed(() => ['slide', 'presenter'].includes($renderContext.value))
const title = computed(() => asText(config.value.academyTitle, 'TULIP Lab'))
const tagline = computed(() => asText(config.value.academyTagline, 'Team for Universal Learning and Intelligent Processing'))
const logo = computed(() => {
  const configured = asText(config.value.academyLogo)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultLogo
})
const links = computed(() => {
  const configured = asLinkList(config.value.academyLinks)
  return configured.length
    ? configured
    : [
        { label: 'TULIP Academy', url: 'https://www.tulip.academy' },
        { label: 'GitHub', url: 'https://github.com/tulip-lab' },
      ]
})
const researchAreas = computed(() => {
  const configured = asResearchAreaList(config.value.academyResearchAreas)
  return configured.length
    ? configured
    : [
        { title: 'Artificial Intelligence', description: 'Develop advanced algorithms and learning techniques that automate complex intelligent tasks.' },
        { title: 'Business Intelligence', description: 'Turn organisational data into evidence for analytics, forecasting, and AI-supported decisions.' },
        { title: 'Privacy & Security', description: 'Strengthen cyber security while preserving individual privacy throughout data analysis.' },
        { title: 'Applications', description: 'Translate AI and data science methods into practical solutions across research and industry domains.' },
      ]
})
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="standard-content">
      <header>
        <h1>{{ title }}</h1>
        <p>{{ tagline }}</p>
      </header>

      <div class="academy-grid">
        <section class="academy-identity">
          <img :src="logo" alt="TULIP Lab logo">
          <p class="academy-intro">An online research lab on intelligent techniques, established at Deakin in 2006.</p>
          <div class="academy-links">
            <a v-for="link in links" :key="link.url" :href="link.url">
              <span>{{ link.label }}</span><strong>Open</strong>
            </a>
          </div>
        </section>

        <section class="research-panel">
          <p class="panel-label">Research areas</p>
          <div class="research-list">
            <article
              v-for="(area, index) in researchAreas"
              :key="area.title"
              :class="{ 'research-area--visible': !animateResearchAreas || $clicks >= index + 1 }"
              :aria-hidden="animateResearchAreas && $clicks < index + 1"
            >
              <strong>{{ area.title }}</strong>
              <p>{{ area.description }}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.standard-content { position: absolute; inset: 12% 5.5% 10.5%; z-index: 1; }
header h1 { margin: 0; }
header p {
  margin: 0.18rem 0 0;
  color: rgba(60, 60, 60, 0.62);
  font-family: var(--tulip-sans);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
.academy-grid {
  display: grid;
  grid-template-columns: minmax(18rem, 0.82fr) minmax(0, 1.18fr);
  gap: 2.5rem;
  height: calc(100% - 5rem);
  margin-top: 1.35rem;
  align-items: center;
}
.academy-identity {
  display: flex;
  min-height: 21rem;
  border-right: 1px solid var(--tulip-block-rule);
  padding: 0.5rem 2.5rem 0.5rem 0;
  flex-direction: column;
  justify-content: center;
}
.panel-label {
  margin: 0 0 0.9rem;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 800;
  text-transform: uppercase;
}
.academy-identity img { width: 10rem; max-height: 14rem; margin: 0.2rem auto 1rem; object-fit: contain; }
.academy-intro { margin: 0 auto 1.15rem; max-width: 18rem; font-size: 0.8rem; line-height: 1.45; text-align: center; }
.academy-links { display: grid; gap: 0.25rem; }
.academy-links a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--tulip-block-rule);
  padding: 0.55rem 0;
  font-size: 0.82rem;
  text-decoration: none;
}
.academy-links a:last-child { border-bottom: 1px solid var(--tulip-block-rule); }
.academy-links strong { color: var(--tulip-purple-dark); font-family: var(--tulip-sans); font-size: var(--tulip-caption-size); text-transform: uppercase; }
.research-panel { min-width: 0; }
.research-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.3rem; }
.research-list article {
  min-height: 8.4rem;
  border-top: 3px solid var(--tulip-purple);
  padding: 0.85rem 0.2rem 0;
  opacity: 0;
  transform: translateY(0.6rem);
  transition: opacity 240ms ease, transform 240ms ease;
}
.research-list article.research-area--visible {
  opacity: 1;
  transform: translateY(0);
}
.research-list strong { color: var(--pd1); font-size: 1rem; }
.research-list p { margin: 0.42rem 0 0; font-size: 0.8rem; line-height: 1.45; }
</style>
