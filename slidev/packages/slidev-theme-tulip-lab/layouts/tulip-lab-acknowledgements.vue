<script setup lang="ts">
import { computed } from 'vue'
import defaultLogo from '../assets/tulip-logo.png'
import { asAcknowledgementText, normaliseAcknowledgementPeople } from '../utils/acknowledgements'
import { resolvePublicAssetPath } from '../utils/coverConfig'

interface Props {
  title?: string
  people?: unknown
  labAcknowledgement?: string
  labUrl?: string
  labUrlLabel?: string
  labLogo?: string
}

const props = defineProps<Props>()
const title = computed(() => asAcknowledgementText(props.title, 'Acknowledgements'))
const people = computed(() => normaliseAcknowledgementPeople(props.people))
const labAcknowledgement = computed(() => asAcknowledgementText(props.labAcknowledgement, 'TULIP Lab members'))
const labUrl = computed(() => asAcknowledgementText(props.labUrl, 'https://www.tulip.academy'))
const labUrlLabel = computed(() => asAcknowledgementText(props.labUrlLabel, 'tulip.academy'))
const labLogo = computed(() => {
  const configured = asAcknowledgementText(props.labLogo)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultLogo
})
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${people.value.length > 5 ? 3 : Math.max(people.value.length, 1)}, minmax(0, 1fr))`,
}))
const densityClass = computed(() => {
  if (people.value.length > 5)
    return 'people-grid--dense'
  if (people.value.length > 3)
    return 'people-grid--many'
  return 'people-grid--few'
})
const resolvePhoto = (photo: string) => resolvePublicAssetPath(photo, import.meta.env.BASE_URL) ?? photo
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main
      class="acknowledgements-wrap"
      :class="{ 'acknowledgements-wrap--team-only': !people.length }"
    >
      <header>
        <h1>{{ title }}</h1>
        <p>Research collaborators</p>
      </header>

      <section
        v-if="people.length"
        class="people-grid"
        :class="densityClass"
        :style="gridStyle"
        aria-label="Acknowledged collaborators"
      >
        <article v-for="person in people" :key="`${person.name}-${person.affiliation}`" class="person">
          <div class="portrait-frame">
            <img
              :src="resolvePhoto(person.photo)"
              :alt="person.name"
            >
          </div>
          <div class="person-copy">
            <p class="person-name">{{ person.name }}</p>
            <p class="person-affiliation">{{ person.affiliation }}</p>
          </div>
        </article>
      </section>

      <a class="lab-credit" :href="labUrl">
        <img :src="labLogo" alt="TULIP Lab logo">
        <span>
          <strong>With thanks to {{ labAcknowledgement }}</strong>
          <small>{{ labUrlLabel }}</small>
        </span>
      </a>
    </main>
  </div>
</template>

<style scoped>
.acknowledgements-wrap {
  position: absolute;
  inset: 12% 5.5% 10.5%;
  z-index: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 1rem;
}

header h1 { margin: 0; }
header p {
  margin: 0.18rem 0 0;
  color: rgba(60, 60, 60, 0.62);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 700;
  text-transform: uppercase;
}

.people-grid {
  display: grid;
  min-height: 0;
  align-items: center;
  justify-items: center;
  gap: 1.2rem;
}

.person {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.portrait-frame {
  width: min(10.5rem, 100%);
  overflow: hidden;
  border: 1px solid var(--tulip-block-rule);
  border-radius: 0.45rem;
  aspect-ratio: 4 / 5;
  background: var(--tulip-block-surface-subtle);
  box-shadow: var(--tulip-shadow-raised);
}

.portrait-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.person-copy { min-width: 0; margin-top: 0.68rem; }
.person-name {
  margin: 0;
  color: var(--pd1);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
}
.person-affiliation {
  margin: 0.2rem auto 0;
  max-width: 16rem;
  color: rgba(29, 43, 58, 0.72);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  line-height: 1.3;
}

.people-grid--many { gap: 0.8rem; }
.people-grid--many .portrait-frame { width: min(8rem, 100%); }
.people-grid--many .person-name { font-size: 0.9rem; }
.people-grid--many .person-affiliation { font-size: var(--tulip-caption-size); }

.people-grid--dense { gap: 0.8rem 1.2rem; }
.people-grid--dense .person {
  display: grid;
  width: 100%;
  grid-template-columns: 5.8rem minmax(0, 1fr);
  gap: 0.85rem;
  text-align: left;
}
.people-grid--dense .portrait-frame { width: 5.8rem; }
.people-grid--dense .person-copy { margin-top: 0; }
.people-grid--dense .person-affiliation { margin-left: 0; }

.lab-credit {
  display: flex;
  min-height: 3.6rem;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  border-top: 1px solid rgba(90, 92, 148, 0.24);
  padding-top: 0.75rem;
  color: var(--tulip-ink);
  text-decoration: none;
}
.lab-credit img { width: auto; height: 3rem; object-fit: contain; }
.lab-credit span { display: flex; flex-direction: column; }
.lab-credit strong { color: var(--pd1); font-size: 0.88rem; }
.lab-credit small {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
}

.acknowledgements-wrap--team-only {
  grid-template-rows: auto minmax(0, 1fr);
}
.acknowledgements-wrap--team-only .lab-credit {
  align-self: center;
  border-top: 0;
  padding-top: 0;
  flex-direction: column;
  text-align: center;
}
.acknowledgements-wrap--team-only .lab-credit img { height: 9rem; }
.acknowledgements-wrap--team-only .lab-credit strong { font-size: 1.1rem; }
</style>
