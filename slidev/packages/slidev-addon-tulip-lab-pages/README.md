# slidev-addon-tulip-lab-pages

Reusable TULIP Lab pages for Slidev courses and talks. The addon owns the
speaker profile, Deakin University context, TULIP Lab introduction, research
collaborations, questions, and contact layouts together with their shared
media.

After the release is published, install its exact version:

```sh
pnpm add slidev-addon-tulip-lab-pages@0.2.2
```

Enable the addon and provide speaker/contact metadata in deck headmatter:

```yaml
addons:
  - slidev-addon-tulip-lab-pages
author: Professor Gang Li
affiliation: Deakin University, Australia
speakerProfileUrl: https://www.tulip.academy/members/gangli/
speakerHighlights:
  - Researcher Development Director, Deakin Cyber
email: director@tulip.academy
website: https://www.tulip.academy
websiteLabel: tulip.academy
github: https://github.com/tulip-lab
githubLabel: tulip-lab
scholar: https://scholar.google.com/citations?user=dqwjm-0AAAAJ&hl=en
scholarLabel: Google Scholar
```

Add the standard pages explicitly where they belong in the deck:

```yaml
---
layout: tulip-speaker
section: TULIP Lab
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
clicks: 4
includeResearch: true
heading: TULIP Lab
tagline: Research framework & global network
topics:
  - Artificial Intelligence
  - Business Intelligence
regions:
  - name: India
    label: South Asia
    institutions:
      - Example University
    photos:
      - src: /collaborations/example-university.jpg
        alt: Research visit at Example University
        fit: contain
---

---
layout: tulip-questions
section: Closing
tocExpand: false
session: Questions
navigation: false
---

---
layout: tulip-contact
title: Contact
session: Contact
---
```

The profile pages share one visible `TULIP Lab` section with three sessions:
`Gang Li`, `Deakin`, and `TULIP Lab`. `tocExpand: false` shows only the parent
section in the table of contents while retaining all three sessions in the top
navigation. The Deakin page uses one click to switch from institutional context
to rankings evidence. The TULIP Lab page uses its initial state for the research
framework, followed by one click state per collaboration region.

The two closing pages share one visible `Closing` section with `Questions` and
`Contact` sessions. `tocExpand: false` keeps those sessions out of the table of
contents, while `navigation: false` keeps the section out of footer navigation.
Both pages retain session-aware top navigation.

Layouts are explicit rather than injected automatically, so each deck retains
control of its narrative order. Stable Gang Li, Deakin, and TULIP Lab content
is maintained in the addon, while each deck owns its ordering and any
audience-specific overrides. Shared media is bundled from the addon; the TULIP
Lab theme supplies Professor Gang Li's default cover portrait. A deck can
override changing content and media without publishing a new addon version:

```yaml
# Files beginning with / are resolved from this deck's public/ directory.
authorPhoto: /cover-portrait.png
speakerPhoto: /speaker-photo.jpg
questionsImage: /questions.gif
academyLogo: /academy-logo.png
contactLogo: /contact-logo.png
contactQrCode: /homepage-qr.svg
contactQrAlt: QR code for personal homepage
contactTitle: Stay Connected

academyTitle: TULIP Lab
academyTagline: Team for Universal Learning and Intelligent Processing
academyLinks:
  - label: TULIP Academy
    url: https://www.tulip.academy
  - label: GitHub
    url: https://github.com/tulip-lab
academyResearchAreas:
  - title: Artificial Intelligence
    description: Intelligent systems, learning, and automation.
```

Collaboration photos also remain deck-local. With `includeResearch: true`, the
`tulip-collaborations` layout keeps the TULIP Lab identity fixed on the left,
uses click zero for the research framework, and then moves through the
configured regions. Set `clicks` to the number of regions. Without the research
state, set `clicks` to one less than the number of regions. Keep each region to
at most six photos. Set an individual photo to `fit: contain` when a portrait
or poster must remain fully visible instead of filling its grid cell.

The earlier `tulip-academy` and `tulip-deakin-rankings` layouts remain available
for decks that intentionally need separate pages, but the combined switch
layouts are the default for new talks.

`authorPhoto` is used only on the cover; `speakerPhoto` is used only on the
speaker page. The bundled images remain fallbacks when these fields are absent.
