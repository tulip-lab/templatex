---
theme: slidev-theme-tulip-lab
addons:
  - slidev-addon-tulip-lab-pages
title: TULIP Lab Slidev Layout Gallery
subtitle: Shared layouts for courses and talks
layout: cover
course: TULIP Lab
author: Professor Gang Li
affiliation: Deakin University, Australia
contactOrganisation: School of Information Technology
email: director@tulip.academy
website: https://www.tulip.academy
websiteLabel: tulip.academy
speakerProfileUrl: https://www.tulip.academy/members/gangli/
contactQrUrl: https://www.tulip.academy/members/gangli/
contactQrCode: /missing-contact-qr.svg
aspectRatio: 16/10
canvasWidth: 1280
---

---
layout: toc
navigation: toc
---

<TableOfContents />

---
layout: section
section: Core Layouts
block: 1
---

# Core Layouts

Consistent geometry across every presentation.

---
layout: default
session: 1A
sessionTitle: Default
---

::header::

# Default Layout

<div class="tulip-purpose">A stable title region above the content body</div>

::default::

- Clear hierarchy
- Predictable content area
- Shared navigation shell

---
layout: wideslide
session: 1B
sessionTitle: Wideslide
---

::header::

# Wideslide Layout

<div class="tulip-purpose">More horizontal space for diagrams and comparisons</div>

::default::

<div class="grid grid-cols-4 gap-4">
  <div class="tulip-card"><span class="tulip-label">Question</span><p class="tulip-body">Ordinary structure</p></div>
  <div class="tulip-card tulip-card--risk"><span class="tulip-label">Risk</span><p class="tulip-supporting">A material failure state</p></div>
  <div class="tulip-card tulip-card--warning"><span class="tulip-label">Warning</span><p class="tulip-supporting">A decision needs attention</p></div>
  <div class="tulip-card tulip-card--outcome"><span class="tulip-label">Outcome</span><p class="tulip-caption">A validated result</p></div>
</div>

---
layout: two-cols-header
session: 1C
sessionTitle: Two Columns
---

# Two Columns

<div class="tulip-purpose">Place two related perspectives under one heading</div>

::left::

<div class="tulip-panel-title">Courses</div>

- Learning sequence
- Practice and feedback

::right::

<div class="tulip-panel-title">Talks</div>

- Research narrative
- Evidence and implications

---
layout: wideslide
class: tulip-balanced tulip-long-title
section: Visual Contract
block: 2
session: Surfaces
---

::header::

# Visual Contract: Balanced Evidence Above a Stable Takeaway Without Leaving Unexplained Empty Space

<div class="tulip-purpose">Use one surface family to create hierarchy without decorative colour</div>

::default::

<div class="tulip-balanced-content tulip-fill-grid grid grid-cols-4 gap-4">
  <article class="tulip-card tulip-card--subtle tulip-fill-card"><strong>Inset</strong><br><small>Quiet supporting context</small></article>
  <article class="tulip-card tulip-fill-card"><strong>Standard</strong><br><small>Ordinary evidence</small></article>
  <article class="tulip-card tulip-card--soft tulip-fill-card"><strong>Soft</strong><br><small>Current emphasis</small></article>
  <article class="tulip-card tulip-card--strong tulip-fill-card"><strong>Strong</strong><br><small>Concluding output</small></article>
</div>

<div class="tulip-takeaway tulip-takeaway--bottom"><strong>Takeaway:</strong> Evidence expands to meet the conclusion without leaving an unexplained gap.</div>

---
layout: wideslide
class: tulip-balanced
session: Switch
clicks: 2
---

::header::

# Stable Staged Switch

<div class="tulip-purpose">Keep the rail, evidence frame, and semantic state colours stable across every click</div>

::default::

<div class="tulip-balanced-content tulip-switch">
  <aside class="tulip-switch-rail" aria-label="Visual contract stages">
    <div class="tulip-switch-step" :class="{ 'is-active': $clicks === 0 }"><span>01</span><strong>Question</strong><small>Frame the decision</small></div>
    <div class="tulip-switch-step" :class="{ 'is-active': $clicks === 1 }"><span>02</span><strong>Evidence</strong><small>Interpret the signal</small></div>
    <div class="tulip-switch-step is-output" :class="{ 'is-active': $clicks >= 2 }"><span>03</span><strong>Outcome</strong><small>State the result</small></div>
  </aside>
  <div class="tulip-switch-stage">
    <section v-if="$clicks === 0" class="h-full flex flex-col justify-center gap-4 p-10">
      <div class="tulip-purpose">QUESTION</div>
      <h2>What must remain stable while the evidence changes?</h2>
      <p>The outer frame, reading order, and control geometry should not move between states.</p>
    </section>
    <section v-else-if="$clicks === 1" class="h-full flex flex-col justify-center gap-4 p-10">
      <div class="tulip-purpose">EVIDENCE</div>
      <h2>Each state carries enough context to stand alone.</h2>
      <p>Labels, interpretation, and supporting detail stay inside one consistent evidence frame.</p>
    </section>
    <section v-else class="h-full flex flex-col justify-center gap-4 p-10">
      <div class="tulip-purpose">OUTCOME</div>
      <h2>The result is semantic, not merely another decorative colour.</h2>
      <p>The stronger surface is reserved for the actual output of the sequence.</p>
    </section>
  </div>
</div>

<div class="tulip-takeaway tulip-takeaway--bottom"><strong>Takeaway:</strong> Interaction changes meaning while the composition remains predictable.</div>

---
layout: wideslide
class: tulip-balanced
session: Evidence
sessionTitle: Evidence
---

::header::

# Evidence: Show What the Process Changes

<div class="tulip-purpose">Visible labels make the source, selection logic, and consequences inspectable</div>

::default::

<div class="tulip-balanced-content grid grid-cols-[1fr_auto_1fr_auto_1.25fr] gap-4 items-stretch">
  <article class="tulip-evidence-panel tulip-fill-card" data-semantic-role="source">
    <div class="tulip-purpose">SOURCE</div>
    <h2>Candidate literature</h2>
    <p>The documented search retains a visible trail:</p>
    <ul>
      <li>database records and query</li>
      <li>deduplicated citations</li>
      <li>retrieval date and scope</li>
    </ul>
  </article>
  <div class="flex items-center text-2xl text-[var(--tulip-purple)]" aria-hidden="true">&rarr;</div>
  <article class="tulip-card tulip-card--soft tulip-fill-card" data-semantic-role="process">
    <div class="tulip-purpose">TRANSFORMATION</div>
    <h2>Eligibility filter</h2>
    <p>Published criteria determine what remains visible:</p>
    <ul>
      <li>relevance to the question</li>
      <li>method and evidence quality</li>
      <li>recorded exclusion reason</li>
    </ul>
  </article>
  <div class="flex items-center text-2xl text-[var(--tulip-purple)]" aria-hidden="true">&rarr;</div>
  <article class="tulip-card tulip-card--strong tulip-fill-card" data-semantic-role="outcome">
    <div class="tulip-purpose">OUTCOME</div>
    <h2>Interpretable evidence set</h2>
    <p><strong>Included:</strong> evidence supporting the synthesis.</p>
    <p><strong>Excluded:</strong> evidence made less visible by the filter.</p>
    <p><strong>Trace:</strong> each claim links back to a recorded decision.</p>
  </article>
</div>

<div class="tulip-takeaway tulip-takeaway--bottom"><strong>Takeaway:</strong> A meaningful visual exposes what enters, what changes it, and what becomes visible.</div>

---
layout: tulip-speaker
section: Shared Pages
tocExpand: false
session: Gang Li
---

---
layout: tulip-deakin
session: Deakin
clicks: 1
---

---
layout: tulip-collaborations
session: TULIP Lab
clicks: 1
includeResearch: true
homeQr: /missing-home-qr.svg
homeCta: Explore TULIP Lab
heading: TULIP Lab
tagline: Research framework & global network
topics:
  - Artificial Intelligence
  - Business Intelligence
  - Privacy & Security
  - Applied Analytics
regions:
  - name: Asia-Pacific
    label: Research Network
    institutions:
      - Deakin University
      - TULIP Lab
      - University of Technology Sydney
      - Indian Institute of Management
    photos:
      - src: /fixtures/deakin-mark.png
        alt: Deakin University mark
        fit: contain
      - src: /fixtures/tulip-logo.png
        alt: TULIP Lab mark
        fit: contain
---

---
layout: tulip-contact
session: Contact
---

---
layout: tulip-lab-acknowledgements
session: Acknowledgements
people: []
---

---
layout: tulip-questions
section: Closing
tocExpand: false
session: Questions
navigation: false
---

---
layout: references
section: References
block: 3
navigation: false
balanced: true
columns: 2
---

# References

1. TULIP Lab. (2026). *TULIP Lab Slidev layout gallery*.
2. Adobe. (2021). *Source Serif 4*.
3. Adobe. (2021). *Source Sans 3*.
4. Slidev. (2026). *Presentation slides for developers*.
5. TULIP Lab. (2026). *Visual contract for shared presentations*.
6. W3C. (2023). *Web Content Accessibility Guidelines 2.2*.
7. Microsoft. (2024). *Playwright documentation*.
8. Vue.js. (2025). *Vue 3 documentation*.

---
layout: contact
section: Contact
block: 4
---

# Contact

[TULIP Lab](https://www.tulip.academy/)<br>
[GitHub](https://github.com/tulip-lab)
