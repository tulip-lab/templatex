<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="standard-content">
      <header>
        <h1>Deakin Rankings - Recent Trend</h1>
        <p>Compare direction across benchmarks rather than relying on one ranking</p>
      </header>

      <table>
        <thead><tr><th>Benchmark</th><th>2023</th><th>2024</th><th>2025</th><th>2026</th><th>2027</th></tr></thead>
        <tbody>
          <tr><td><strong>QS World</strong></td><td>266</td><td>233</td><td>197</td><td>207</td><td>227</td></tr>
          <tr><td><strong>THE World</strong></td><td>251-300</td><td>301-350</td><td>201-250</td><td>201-250</td><td>-</td></tr>
          <tr><td><strong>ARWU World</strong></td><td>201-300</td><td>201-300</td><td>201-300</td><td>-</td><td>-</td></tr>
          <tr><td><strong>CWUR World</strong></td><td>367</td><td>363</td><td>365</td><td>-</td><td>-</td></tr>
          <tr><td><strong>US News Best Global Universities</strong></td><td>217</td><td>177</td><td>173</td><td>-</td><td>-</td></tr>
          <tr><td><strong>QS Sustainability</strong></td><td>-</td><td>=233</td><td>66</td><td>112</td><td>-</td></tr>
          <tr><td><strong>CWTS Leiden - scientific impact</strong></td><td>-</td><td>-</td><td>#3 VIC</td><td>-</td><td>-</td></tr>
        </tbody>
      </table>

      <div class="benchmark-strengths">
        <article><span>SHANGHAIRANKING 2025</span><strong>#26 worldwide</strong><p>Hospitality &amp; Tourism Management</p></article>
        <article><span>SHANGHAIRANKING 2025</span><strong>#4 in Australia</strong><p>Hospitality &amp; Tourism Management</p></article>
        <article><span>QS BY SUBJECT 2026</span><strong>101-150 worldwide</strong><p>Hospitality &amp; Leisure Management</p></article>
        <article class="computing-strength"><span>SHANGHAIRANKING 2025</span><strong>101-150 worldwide</strong><p>Computer Science &amp; Engineering</p></article>
      </div>

      <p class="sources">
        Sources:
        <a href="https://www.deakin.edu.au/about-deakin/why-deakin/our-university-rankings">Deakin Rankings</a> ·
        <a href="https://www.topuniversities.com/universities/deakin-university">QS</a> ·
        <a href="https://www.topuniversities.com/sustainability-rankings">QS Sustainability</a> ·
        <a href="https://www.timeshighereducation.com/world-university-rankings/deakin-university">THE</a> ·
        <a href="https://www.shanghairanking.com/rankings/gras/2025/AS0513">Shanghai Tourism</a> ·
        <a href="https://www.shanghairanking.com/rankings/gras/2025/AS0210">Shanghai Computer Science</a> ·
        <a href="https://www.topuniversities.com/university-subject-rankings/hospitality-leisure-management?region=Oceania">QS Hospitality</a> ·
        <a href="https://cwur.org/2025/deakin-university.php">CWUR</a> ·
        <a href="https://www.usnews.com/education/best-global-universities/deakin-university-504307">US News</a>
      </p>
    </main>
  </div>
</template>

<style scoped>
.standard-content { position: absolute; inset: 12% 5.5% 10.5%; z-index: 1; }
header h1 { margin: 0; }
header p {
  margin: 0.18rem 0 1rem;
  color: rgba(60, 60, 60, 0.62);
  font-family: var(--tulip-sans);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
table { font-size: 0.88rem; }
.benchmark-strengths {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}
.benchmark-strengths article {
  border-top: 3px solid var(--tulip-purple);
  padding: 0.65rem 0.75rem 0;
}
.benchmark-strengths .computing-strength { border-top-color: var(--tulip-purple-dark); }
.benchmark-strengths span { color: var(--tulip-purple-dark); font-family: var(--tulip-sans); font-size: var(--tulip-caption-size); font-weight: 800; }
.benchmark-strengths strong { display: block; margin-top: 0.22rem; color: var(--pd1); font-size: 0.88rem; }
.benchmark-strengths p { margin: 0.2rem 0 0; font-size: 0.7rem; line-height: 1.3; }
.sources { margin-top: 0.75rem; font-size: var(--tulip-label-size); opacity: 0.72; }
</style>
