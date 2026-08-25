<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const { $clicks, $renderContext } = useSlideContext()
const exportRoute = computed(() => typeof window !== 'undefined' && /\/export(?:\/|$)/.test(window.location.pathname))
const interactive = computed(() => !exportRoute.value && ['slide', 'presenter'].includes($renderContext.value))
const activeIndex = computed(() => Math.min(Math.max($clicks.value, 0), 1))

const contextItems = [
  { label: 'Global standing', value: 'Top 1%', detail: 'Top 250 in QS 2027; 201–250 in THE 2026; 201–300 in ARWU 2025.' },
  { label: 'Research quality', value: '#5 Australia', detail: 'Research quality position reported in THE World University Rankings 2026.' },
  { label: 'Student experience', value: '#1 Victoria', detail: 'Course satisfaction for 16 consecutive years.' },
  { label: 'International experience', value: '#1 Australia', detail: 'International student happiness and satisfaction in the 2025 ISB.' },
]

const rankingRows = [
  ['QS World', '266', '233', '197', '207', '227'],
  ['THE World', '251–300', '301–350', '201–250', '201–250', '—'],
  ['ARWU World', '201–300', '201–300', '201–300', '—', '—'],
  ['CWUR World', '367', '363', '365', '—', '—'],
  ['US News Global', '217', '177', '173', '—', '—'],
  ['QS Sustainability', '—', '=233', '66', '112', '—'],
  ['CWTS Leiden impact', '—', '—', '#3 VIC', '—', '—'],
]

const subjectStrengths = [
  { value: '#26 world', label: 'Hospitality & Tourism Management', source: 'ShanghaiRanking 2025' },
  { value: '#4 Australia', label: 'Hospitality & Tourism Management', source: 'ShanghaiRanking 2025' },
  { value: '101–150 world', label: 'Hospitality & Leisure Management', source: 'QS by Subject 2026' },
  { value: '101–150 world', label: 'Computer Science & Engineering', source: 'ShanghaiRanking 2025' },
]
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="deakin-shell">
      <aside class="deakin-rail">
        <p class="eyebrow">Deakin University</p>
        <h1>Context and evidence</h1>
        <p class="rail-intro">A research environment shaped by global reach, disciplinary depth, and student experience.</p>

        <div class="state-list" aria-label="Deakin page states">
          <div :class="{ 'state-item--active': !interactive || activeIndex === 0 }" class="state-item">
            <span>01</span>
            <strong>Why Deakin</strong>
          </div>
          <div :class="{ 'state-item--active': !interactive || activeIndex === 1 }" class="state-item">
            <span>02</span>
            <strong>Evidence &amp; rankings</strong>
          </div>
        </div>

        <p class="rail-takeaway">Read rankings as converging signals—not as a single definitive score.</p>
      </aside>

      <section class="deakin-stage">
        <div v-if="!interactive" class="print-summary">
          <section>
            <header class="stage-header">
              <p>Why Deakin</p>
              <h2>Strength across research and experience</h2>
            </header>
            <div class="print-context-list">
              <article v-for="item in contextItems" :key="item.label">
                <span>{{ item.label }}</span><strong>{{ item.value }}</strong>
              </article>
            </div>
          </section>
          <section>
            <header class="stage-header">
              <p>Evidence</p>
              <h2>Multiple benchmarks, one broad signal</h2>
            </header>
            <div class="print-strength-list">
              <article v-for="item in subjectStrengths" :key="`${item.value}-${item.label}`">
                <strong>{{ item.value }}</strong>
                <span>{{ item.label }}</span>
              </article>
            </div>
          </section>
        </div>

        <Transition v-else name="state-shift" mode="out-in">
          <section v-if="activeIndex === 0" key="context" class="state-panel context-panel">
            <header class="stage-header">
              <p>Why Deakin</p>
              <h2>Global standing is only part of the story</h2>
              <span>Research quality, strong disciplines, and student experience provide the operating context for TULIP Lab.</span>
            </header>

            <div class="context-list">
              <article v-for="item in contextItems" :key="item.label">
                <div>
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <p>{{ item.detail }}</p>
              </article>
            </div>

            <div class="discipline-note">
              <span>Discipline strength</span>
              <p><strong>#1</strong> sport science · <strong>#13</strong> education and educational research · <strong>#14</strong> nursing</p>
            </div>

            <p class="sources">
              Sources:
              <a href="https://www.deakin.edu.au/about-deakin/why-deakin/our-university-rankings">Deakin University Rankings</a> ·
              <a href="https://www.shanghairanking.com/universities/deakin-university">ShanghaiRanking</a> ·
              <a href="https://www.timeshighereducation.com/world-university-rankings/deakin-university">THE</a>
            </p>
          </section>

          <section v-else key="evidence" class="state-panel evidence-panel">
            <header class="stage-header">
              <p>Evidence &amp; rankings</p>
              <h2>Compare direction across benchmarks</h2>
              <span>No single ranking captures institutional quality; the pattern across measures is more informative.</span>
            </header>

            <table>
              <thead>
                <tr><th>Benchmark</th><th>2023</th><th>2024</th><th>2025</th><th>2026</th><th>2027</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in rankingRows" :key="row[0]">
                  <td><strong>{{ row[0] }}</strong></td>
                  <td v-for="(value, index) in row.slice(1)" :key="index">{{ value }}</td>
                </tr>
              </tbody>
            </table>

            <div class="subject-strengths">
              <article v-for="item in subjectStrengths" :key="`${item.value}-${item.label}`">
                <span>{{ item.source }}</span>
                <strong>{{ item.value }}</strong>
                <p>{{ item.label }}</p>
              </article>
            </div>

            <div class="evidence-reading">
              <strong>How to read the pattern</strong>
              <p>Overall position varies with each methodology, while hospitality, tourism, and computing provide clear discipline-level strengths.</p>
            </div>

            <p class="sources">
              Sources:
              <a href="https://www.deakin.edu.au/about-deakin/why-deakin/our-university-rankings">Deakin Rankings</a> ·
              <a href="https://www.topuniversities.com/universities/deakin-university">QS</a> ·
              <a href="https://www.timeshighereducation.com/world-university-rankings/deakin-university">THE</a> ·
              <a href="https://www.shanghairanking.com/rankings/gras/2025/AS0513">Shanghai Tourism</a> ·
              <a href="https://www.shanghairanking.com/rankings/gras/2025/AS0210">Shanghai Computer Science</a>
            </p>
          </section>
        </Transition>
      </section>
    </main>
  </div>
</template>

<style scoped>
.deakin-shell {
  position: absolute;
  inset: 10.5% 5.5% 9.5%;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(15.5rem, 0.62fr) minmax(0, 1.58fr);
  gap: 2.4rem;
}

.deakin-rail {
  display: flex;
  min-width: 0;
  border-right: 1px solid var(--tulip-block-rule);
  padding: 0.4rem 2rem 0.4rem 0;
  flex-direction: column;
  justify-content: center;
}

.eyebrow,
.stage-header > p {
  margin: 0;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 850;
  text-transform: uppercase;
}

.deakin-rail h1 {
  margin: 0.28rem 0 0;
  font-size: 2.1rem;
  line-height: 1.04;
}

.rail-intro {
  margin: 0.9rem 0 1.35rem;
  color: rgba(29, 43, 58, 0.72);
  font-size: 0.78rem;
  line-height: 1.46;
}

.state-list {
  display: grid;
  border-top: 1px solid var(--tulip-block-rule);
}

.state-item {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: center;
  border-bottom: 1px solid var(--tulip-block-rule);
  padding: 0.62rem 0;
  color: rgba(29, 43, 58, 0.44);
}

.state-item span {
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 800;
}

.state-item strong {
  font-size: 0.75rem;
}

.state-item--active {
  color: var(--pd1);
}

.state-item--active span {
  color: var(--tulip-purple);
}

.rail-takeaway {
  border-left: 3px solid var(--tulip-purple);
  margin: 1.25rem 0 0;
  padding-left: 0.72rem;
  color: var(--pd1);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.35;
}

.deakin-stage {
  min-width: 0;
  min-height: 0;
}

.state-panel {
  display: grid;
  height: 100%;
  min-height: 0;
  align-content: start;
}

.context-panel {
  align-content: center;
}

.evidence-panel {
  align-content: center;
}

.stage-header h2 {
  margin: 0.2rem 0 0;
  color: var(--pd1);
  font-size: 1.72rem;
  line-height: 1.06;
}

.stage-header > span {
  display: block;
  margin-top: 0.45rem;
  color: rgba(29, 43, 58, 0.64);
  font-size: 0.71rem;
  line-height: 1.38;
}

.context-list {
  display: grid;
  margin-top: 1.05rem;
  border-top: 1px solid var(--tulip-block-rule);
}

.context-list article {
  display: grid;
  grid-template-columns: 12rem minmax(0, 1fr);
  gap: 1.1rem;
  align-items: center;
  border-bottom: 1px solid var(--tulip-block-rule);
  padding: 0.6rem 0;
}

.context-list article > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
  align-items: baseline;
}

.context-list span,
.discipline-note > span {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-label-size);
  font-weight: 800;
  text-transform: uppercase;
}

.context-list strong {
  color: var(--tulip-purple-dark);
  font-size: 0.87rem;
  white-space: nowrap;
}

.context-list p {
  margin: 0;
  color: rgba(29, 43, 58, 0.78);
  font-size: var(--tulip-small-size);
  line-height: 1.35;
}

.discipline-note {
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 1rem;
  margin-top: 0.8rem;
  border-left: 3px solid var(--tulip-purple);
  padding: 0.56rem 0.75rem;
  background: var(--tulip-block-surface-soft);
}

.discipline-note p {
  margin: 0;
  font-size: var(--tulip-small-size);
  line-height: 1.3;
}

.evidence-panel table {
  width: 100%;
  margin-top: 0.85rem;
  font-size: var(--tulip-caption-size);
}

.evidence-panel th,
.evidence-panel td {
  padding: 0.34rem 0.42rem;
  text-align: center;
}

.evidence-panel th:first-child,
.evidence-panel td:first-child {
  text-align: left;
}

.subject-strengths {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.8rem;
}

.subject-strengths article {
  border-top: 3px solid var(--tulip-purple);
  padding-top: 0.5rem;
}

.subject-strengths span {
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: var(--tulip-caption-size);
  font-weight: 850;
  text-transform: uppercase;
}

.subject-strengths strong {
  display: block;
  margin-top: 0.18rem;
  color: var(--pd1);
  font-size: 0.78rem;
}

.subject-strengths p {
  margin: 0.17rem 0 0;
  font-size: var(--tulip-caption-size);
  line-height: 1.25;
}

.evidence-reading {
  display: grid;
  grid-template-columns: 9.5rem minmax(0, 1fr);
  gap: 0.9rem;
  margin-top: 0.78rem;
  border-left: 3px solid var(--tulip-purple);
  padding: 0.5rem 0.7rem;
  background: var(--tulip-block-surface-soft);
}

.evidence-reading strong {
  color: var(--pd1);
  font-size: var(--tulip-label-size);
}

.evidence-reading p {
  margin: 0;
  color: rgba(29, 43, 58, 0.74);
  font-size: var(--tulip-caption-size);
  line-height: 1.3;
}

.sources {
  align-self: end;
  margin: 0.55rem 0 0;
  color: rgba(29, 43, 58, 0.56);
  font-size: var(--tulip-caption-size);
  line-height: 1.25;
}

.print-summary {
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  gap: 1.35rem;
  align-items: center;
}

.print-summary section + section {
  border-left: 1px solid var(--tulip-block-rule);
  padding-left: 1.35rem;
}

.print-context-list,
.print-strength-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.print-context-list article,
.print-strength-list article {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  border-bottom: 1px solid var(--tulip-block-rule);
  padding-bottom: 0.45rem;
}

.print-context-list span,
.print-strength-list span {
  color: rgba(29, 43, 58, 0.7);
  font-size: var(--tulip-caption-size);
}

.print-context-list strong,
.print-strength-list strong {
  color: var(--tulip-purple-dark);
  font-size: var(--tulip-label-size);
  white-space: nowrap;
}

.state-shift-enter-active,
.state-shift-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.state-shift-enter-from { opacity: 0; transform: translateX(0.55rem); }
.state-shift-leave-to { opacity: 0; transform: translateX(-0.35rem); }
</style>
