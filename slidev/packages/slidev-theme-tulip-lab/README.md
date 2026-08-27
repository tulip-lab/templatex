# slidev-theme-tulip-lab

TULIP Lab's shared 16:10 Slidev Theme for courses and talks. It provides the branded Cover, acknowledgements, navigation shell, table of contents, section pages, references, contact page, QR code, and reusable content layouts.

Install the exact stable release with `pnpm add slidev-theme-tulip-lab@0.4.1`.

Workspace projects can use it with:

```yaml
---
theme: slidev-theme-tulip-lab
layout: cover
title: Presentation Title
course: TULIP Lab
aspectRatio: 16/10
canvasWidth: 1280
---
```

See the workspace examples for complete Course and Talk decks. Live audience synchronization is provided separately by `slidev-addon-tulip-lab-live`; standard TULIP Lab content pages are provided by `slidev-addon-tulip-lab-pages`.

Research talks can use the theme-owned acknowledgement page directly. Keep
portraits in the deck's `public/acknowledgements/` directory and provide a
confirmed name, affiliation, and photo for each person:

```yaml
---
layout: tulip-lab-acknowledgements
navigation: false
people:
  - name: Dr Example Collaborator
    affiliation: Example University
    photo: /acknowledgements/example-collaborator.jpg
---
```

`section` creates a table-of-contents and bottom-navigation item. `session` and
`sessionTitle` create a child entry in the table of contents and compact top
navigation without adding another bottom-navigation item. A session remains
active until the next `session` or `section` declaration.

Set `tocExpand: false` on a section to keep its sessions in the compact top
navigation while showing only the parent section in the table of contents.

The audience QR code uses the active Slidev base path during local development.
A deployment may set `VITE_TULIP_AUDIENCE_URL` to a relative or absolute Live
audience URL when Static and Live variants use different base paths.

## Visual contract

The public visual API is documented in
[docs/visual-contract.md](docs/visual-contract.md). It defines the supported
typography and surface tokens, card variants, balanced body contract, staged
switch contract, semantic colour rules, [semantic visual](docs/visual-contract.md#semantic-visuals)
requirements, and the [section/session/title hierarchy](docs/visual-contract.md#section-session-and-title-hierarchy).

The Theme bundles OFL-licensed Source Serif 4 and Source Sans 3 at pinned
versions. Consumers therefore get the reviewed typography without depending on
fonts installed on the presenting machine. See `THIRD_PARTY_NOTICES.md`.
Bundled TULIP marks and the default portrait are outside the software licence;
see `LICENSE-BRAND-ASSETS.md` and `ASSET-NOTICES.md`.

Use the shared tokens and classes for reusable structure. Keep domain-specific
grids, figures, and dense-state adjustments in the deck that owns them.

Use `.tulip-body`, `.tulip-supporting`, `.tulip-caption`, and `.tulip-label`
for explicit type roles. Use `.tulip-card--risk`, `.tulip-card--warning`, and
`.tulip-card--outcome` only for their stated semantics. Prose evidence belongs
on `.tulip-evidence-panel`; reserve the dark `.tulip-case-panel` for code,
traces, logs, and raw output.

### Balanced content

When evidence should fill the reading area above a bottom takeaway, add
`class: tulip-balanced` to the slide and keep the content and takeaway as
siblings:

```html
<div class="tulip-balanced-content tulip-fill-grid">
  <article class="tulip-card tulip-fill-card">Evidence</article>
</div>
<div class="tulip-takeaway tulip-takeaway--bottom">Takeaway</div>
```

### Staged switch

Use the switch classes together so the rail and stage retain stable dimensions:

```html
<div class="tulip-balanced-content tulip-switch">
  <aside class="tulip-switch-rail">
    <div class="tulip-switch-step is-active">Current state</div>
    <div class="tulip-switch-step is-output">Result state</div>
  </aside>
  <div class="tulip-switch-stage">Current evidence</div>
</div>
```

Add `tulip-long-title` to the slide frontmatter when its title needs two
balanced lines. Use `is-output` only for a genuine result, not to distinguish
ordinary peer categories.

### Semantic visuals and titles

Make explanatory visuals visibly label their source, transformation, and
outcome. Accessibility labels supplement those visible labels; they do not
replace them. Build deck-specific diagrams from the existing surfaces until a
second deck establishes a reusable semantic pattern.

Use `section` for the stable navigation category, `sessionTitle` for a concise
recurring label such as `AI Moment`, and the H1 for the slide's assertion or
question. Keep generic section and work numbering out of H1s and takeaways.

### References

The `references` layout accepts `balanced: true` for a short vertically balanced
list and `columns: 2` for a longer two-column list. Both are opt-in, so existing
reference slides retain their original flow.

### Visual regression

From the workspace root, run `pnpm check:visual` to compare the layout gallery
with its reviewed 1280x800 baselines. Use `pnpm update:visual` only after
inspecting an intentional visual change. The audit checks projection font
floors, overflow, white-on-white content surfaces, balanced takeaway spacing,
and switch geometry. It cannot judge whether a visual's meaning is clear, so
baseline review remains a required human step.

Audit a complete real deck, including every click state, with:

```sh
pnpm check:deck-visual -- /absolute/path/to/deck
```

The command writes a JSON report, per-state screenshots, and an HTML contact
sheet under `output/deck-visual/`. Errors fail the command; warnings and
human-review prompts remain visible in the report for deliberate inspection.
