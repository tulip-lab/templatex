<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="standard-content">
      <header>
        <h1>Deakin University</h1>
        <p>Academic context for TULIP Lab teaching and research</p>
      </header>

      <div class="highlight-grid">
        <article><span>GLOBAL STANDING</span><strong>Top 1% worldwide</strong><p>Top 250 in QS 2027; 201-250 in THE 2026; 201-300 in ARWU 2025.</p></article>
        <article><span>DISCIPLINE STRENGTH</span><strong>Internationally ranked fields</strong><p>#1 sport science, #13 education and educational research, and #14 nursing.</p></article>
        <article><span>RESEARCH QUALITY</span><strong>#5 in Australia</strong><p>Research quality position reported in the THE World University Rankings 2026.</p></article>
        <article><span>STUDENT EXPERIENCE</span><strong>#1 in Victoria</strong><p>Course satisfaction for 16 years running, based on QILT and Graduate Outcomes Survey results.</p></article>
        <article><span>INTERNATIONAL EXPERIENCE</span><strong>#1 in Australia</strong><p>International student happiness and satisfaction in the 2025 International Student Barometer.</p></article>
      </div>

      <aside class="context-note">
        <strong>Why this context matters</strong>
        <p>Global standing, research quality, and student experience together frame the environment in which TULIP Lab develops teaching, research, and external collaboration.</p>
      </aside>

      <p class="sources">
        Sources:
        <a href="https://www.deakin.edu.au/about-deakin/why-deakin/our-university-rankings">Deakin University Rankings</a> ·
        <a href="https://www.shanghairanking.com/universities/deakin-university">ShanghaiRanking</a> ·
        <a href="https://www.timeshighereducation.com/world-university-rankings/deakin-university">THE</a>
      </p>
    </main>
  </div>
</template>

<style scoped>
.standard-content {
  position: absolute;
  inset: 12% 5.5% 10.5%;
  z-index: 1;
}

header h1 { margin: 0; }
header p {
  margin: 0.18rem 0 0;
  color: rgba(60, 60, 60, 0.62);
  font-family: var(--tulip-sans);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.highlight-grid article {
  grid-column: span 2;
  min-height: 8.7rem;
  border: 1px solid rgba(90, 92, 148, 0.22);
  border-radius: var(--tulip-radius);
  padding: 0.9rem 1rem;
  background: #fff;
  box-shadow: 0 0.18rem 0.7rem rgba(45, 52, 121, 0.07);
}

.highlight-grid article:nth-child(n + 4) { grid-column: span 3; }
.highlight-grid span {
  display: block;
  color: var(--tulip-purple-dark);
  font-family: var(--tulip-sans);
  font-size: 0.62rem;
  font-weight: 800;
}
.highlight-grid strong { display: block; margin-top: 0.25rem; font-size: 1.1rem; }
.highlight-grid p { margin: 0.35rem 0 0; font-size: 0.78rem; line-height: 1.35; }
.context-note {
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  border-left: 4px solid var(--tulip-purple);
  padding: 0.55rem 0.9rem;
  background: color-mix(in srgb, var(--tulip-shell-bottom) 22%, white);
}
.context-note strong { color: var(--pd1); font-size: 0.86rem; }
.context-note p { margin: 0; font-size: 0.78rem; line-height: 1.4; }
.sources { margin-top: 0.65rem; font-size: 0.68rem; opacity: 0.72; }
</style>
