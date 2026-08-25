import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { checkDeck } from '../src/check-deck.mjs'

async function fixture({
  addons = '',
  aspectRatio = '16/10',
  canvasWidth = 1280,
  dependencies = {},
  extraHeadmatter = '',
  extraMarkdown = '',
  layouts = ['tulip-lab-acknowledgements', 'toc', 'tulip-questions', 'tulip-contact'],
  subtitle = 'A test presentation',
} = {}) {
  const root = await mkdtemp(join(tmpdir(), 'tulip-slidev-check-'))
  const slides = `---
theme: slidev-theme-tulip-lab
title: Example
subtitle: ${JSON.stringify(subtitle)}
layout: cover
course: TULIP Lab
author: Example Author
affiliation: Example Institution
aspectRatio: ${aspectRatio}
canvasWidth: ${canvasWidth}
${addons}${extraHeadmatter}---

# Example

${layouts.map(layout => `---
layout: ${layout}
---

# ${layout}
`).join('\n')}
${extraMarkdown}`

  await writeFile(join(root, 'slides.md'), slides)
  await writeFile(join(root, 'package.json'), `${JSON.stringify({ dependencies }, null, 2)}\n`)
  return root
}

const sharedDependencies = {
  '@slidev/cli': '52.19.0',
  'slidev-addon-tulip-lab-pages': '0.2.0',
  'slidev-theme-tulip-lab': '0.2.0',
  'vue': '3.5.41',
}

test('accepts a Talk with exact package versions', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: sharedDependencies,
  })
  const result = await checkDeck(root, { profile: 'talk' })

  assert.deepEqual(result.errors, [])
})

test('accepts a Course with workspace packages and the live addon', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-live
  - slidev-addon-tulip-lab-pages
`,
    dependencies: {
      ...sharedDependencies,
      'slidev-addon-tulip-lab-live': 'workspace:*',
      'slidev-addon-tulip-lab-pages': 'workspace:*',
      'slidev-theme-tulip-lab': 'workspace:*',
    },
    layouts: ['toc', 'tulip-questions', 'tulip-contact'],
  })
  const result = await checkDeck(root, { profile: 'course' })

  assert.deepEqual(result.errors, [])
})

test('requires the Theme and pages addon to use the same published release', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: {
      ...sharedDependencies,
      'slidev-addon-tulip-lab-pages': '0.3.0',
    },
  })
  const result = await checkDeck(root, { profile: 'talk' })

  assert.match(result.errors.join('\n'), /must use the same release version/)
})

test('finds required layouts in imported slide sources', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: sharedDependencies,
    layouts: ['tulip-lab-acknowledgements', 'toc'],
  })
  const slidesPath = join(root, 'slides.md')
  const parts = join(root, 'parts')
  await mkdir(parts)
  await writeFile(slidesPath, `${await readFile(slidesPath, 'utf8')}
---
src: ./parts/close.md
---
`)
  await writeFile(join(parts, 'close.md'), `---
layout: tulip-lab-acknowledgements
---

---
layout: tulip-questions
---

---
layout: tulip-contact
---
`)

  const result = await checkDeck(root, { profile: 'talk' })

  assert.deepEqual(result.errors, [])
})

test('reports geometry, structure, metadata, dependency, and image issues together', async () => {
  const root = await fixture({
    aspectRatio: '16/9',
    canvasWidth: 1920,
    dependencies: {
      '@slidev/cli': '^52.19.0',
      'slidev-theme-tulip-lab': '0.2.0',
    },
    extraMarkdown: `
![](./missing-alt.png)
<img src="another.png">
`,
    layouts: [],
    subtitle: '',
  })
  const result = await checkDeck(root, { profile: 'talk' })
  const output = result.errors.join('\n')

  assert.match(output, /aspectRatio must be "16\/10"/)
  assert.match(output, /canvasWidth must be 1280/)
  assert.match(output, /required headmatter field "subtitle" is missing/)
  assert.match(output, /required layout "toc" is missing/)
  assert.match(output, /required layout "tulip-lab-acknowledgements" is missing/)
  assert.match(output, /required layout "tulip-questions" is missing/)
  assert.match(output, /required layout "tulip-contact" is missing/)
  assert.match(output, /"@slidev\/cli" must use an exact version/)
  assert.match(output, /required dependency "vue" is missing/)
  assert.match(output, /Markdown image needs non-empty alt text/)
  assert.match(output, /HTML image needs non-empty alt text/)
})

test('reports malformed YAML headmatter', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: sharedDependencies,
    extraHeadmatter: 'invalid: [yaml\n',
  })
  const result = await checkDeck(root, { profile: 'talk' })

  assert.match(result.errors.join('\n'), /invalid YAML frontmatter/)
})

test('requires acknowledgements between the Talk cover and table of contents', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: sharedDependencies,
    layouts: ['toc', 'tulip-lab-acknowledgements', 'tulip-questions', 'tulip-contact'],
  })
  const result = await checkDeck(root, { profile: 'talk' })

  assert.match(result.errors.join('\n'), /must place "tulip-lab-acknowledgements" immediately after the cover/)
  assert.match(result.errors.join('\n'), /must place "toc" immediately after "tulip-lab-acknowledgements"/)
})

test('requires a supported profile', async () => {
  const root = await fixture({
    addons: `addons:
  - slidev-addon-tulip-lab-pages
`,
    dependencies: sharedDependencies,
  })

  await assert.rejects(() => checkDeck(root, { profile: 'workshop' }), /profile must be/)
})
