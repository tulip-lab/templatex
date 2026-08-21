# slidev-addon-tulip-lab-pages

Reusable TULIP Lab pages for Slidev courses and talks. The addon owns the
speaker profile, Deakin University context, TULIP Lab introduction, questions,
and contact layouts together with their shared media.

After the release is published, install its exact version:

```sh
pnpm add slidev-addon-tulip-lab-pages@0.2.0
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
---

---
layout: tulip-deakin
---

---
layout: tulip-deakin-rankings
---

---
layout: tulip-academy
clicks: 4
---

---
layout: tulip-questions
section: Closing
toc: false
navigationLabel: Questions
---

---
layout: tulip-contact
title: Contact
navigationLabel: Contact
---
```

The two closing pages share one hidden `Closing` section. `toc: false` keeps
them out of the table of contents and footer navigation, while
`navigationLabel` supplies the page-specific top label.

Layouts are explicit rather than injected automatically, so each deck retains
control of its narrative order. Shared media is bundled from the addon; the
TULIP Lab theme supplies Professor Gang Li's default cover portrait. A deck can
override changing content and media without publishing a new addon version:

```yaml
# Files beginning with / are resolved from this deck's public/ directory.
authorPhoto: /cover-portrait.png
speakerPhoto: /speaker-photo.jpg
questionsImage: /questions.gif
academyLogo: /academy-logo.png
contactLogo: /contact-logo.png
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

`authorPhoto` is used only on the cover; `speakerPhoto` is used only on the
speaker page. The bundled images remain fallbacks when these fields are absent.
