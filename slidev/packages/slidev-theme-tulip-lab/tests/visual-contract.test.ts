import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/visual-contract.md', import.meta.url), 'utf8')
const themeCss = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')
const sectionLayout = readFileSync(new URL('../layouts/section.vue', import.meta.url), 'utf8')
const referencesLayout = readFileSync(new URL('../layouts/references.vue', import.meta.url), 'utf8')
const gallery = readFileSync(new URL('../../../examples/layouts/slides.md', import.meta.url), 'utf8')
const contractProse = contract.replace(/\s+/g, ' ')

const publicTokens = [
  '--tulip-reference-serif',
  '--tulip-serif',
  '--tulip-sans',
  '--tulip-body-size',
  '--tulip-small-size',
  '--tulip-label-size',
  '--tulip-caption-size',
  '--tulip-card-title-size',
  '--tulip-title-size-long',
  '--tulip-canvas',
  '--tulip-block-surface-inset',
  '--tulip-block-surface-subtle',
  '--tulip-block-surface',
  '--tulip-block-surface-soft',
  '--tulip-block-surface-strong',
  '--tulip-block-rule',
  '--tulip-block-rule-strong',
  '--tulip-text-muted',
  '--tulip-shadow',
  '--tulip-shadow-raised',
  '--tulip-state-idle',
  '--tulip-state-active',
  '--tulip-state-output',
]

const publicClasses = [
  'tulip-body',
  'tulip-supporting',
  'tulip-caption',
  'tulip-label',
  'tulip-purpose',
  'tulip-card',
  'tulip-card--subtle',
  'tulip-card--soft',
  'tulip-card--strong',
  'tulip-card--risk',
  'tulip-card--warning',
  'tulip-card--outcome',
  'tulip-evidence-panel',
  'tulip-case-panel',
  'tulip-takeaway',
  'tulip-takeaway--bottom',
  'tulip-long-title',
  'tulip-balanced',
  'tulip-balanced-content',
  'tulip-fill-grid',
  'tulip-fill-card',
  'tulip-switch',
  'tulip-switch-rail',
  'tulip-switch-step',
  'tulip-switch-stage',
]

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('ships and links the public visual contract', () => {
  assert.ok(existsSync(new URL('../docs/visual-contract.md', import.meta.url)))
  assert.ok(packageJson.files.includes('docs'))
  assert.match(readme, /\[docs\/visual-contract\.md\]\(docs\/visual-contract\.md\)/)
  assert.match(readme, new RegExp(`slidev-theme-tulip-lab@${escapeRegex(packageJson.version)}`))
})

test('documents and defines every public visual token', () => {
  for (const token of publicTokens) {
    assert.match(contract, new RegExp('`' + escapeRegex(token) + '`'), `${token} is missing from the visual contract`)
    assert.match(themeCss, new RegExp(`${escapeRegex(token)}\\s*:`), `${token} is missing from the theme stylesheet`)
  }
})

test('documents and defines every public visual class', () => {
  for (const className of publicClasses) {
    assert.match(contract, new RegExp(`\\.${escapeRegex(className)}\\b`), `.${className} is missing from the visual contract`)
    assert.match(themeCss, new RegExp(`\\.${escapeRegex(className)}\\b`), `.${className} is missing from the theme stylesheet`)
  }
})

test('keeps the flat surface and semantic state mappings stable', () => {
  assert.match(themeCss, /--tulip-serif:\s*var\(--tulip-reference-serif\)/)
  assert.match(themeCss, /--tulip-canvas:\s*#fff/)
  assert.match(themeCss, /--tulip-block-surface:\s*color-mix/)
  assert.match(themeCss, /--tulip-shadow:\s*none/)
  assert.match(themeCss, /--tulip-shadow-raised:\s*none/)
  assert.match(themeCss, /--tulip-state-idle:\s*var\(--tulip-block-surface\)/)
  assert.match(themeCss, /--tulip-state-active:\s*var\(--tulip-block-surface-soft\)/)
  assert.match(themeCss, /--tulip-state-output:\s*var\(--tulip-block-surface-strong\)/)
  assert.match(themeCss, /\.tulip-card--red,[\s\S]*\.tulip-card--risk/)
  assert.match(themeCss, /\.tulip-card--warm,[\s\S]*\.tulip-card--warning/)
  assert.match(themeCss, /\.tulip-card--green,[\s\S]*\.tulip-card--outcome/)
  assert.match(themeCss, /\.tulip-evidence-panel,[\s\S]*\.tulip-case-panel--prose/)
  assert.doesNotMatch(sectionLayout, /letter-spacing:\s*-/)
})

test('ships deterministic fonts and opt-in reference balancing', () => {
  assert.equal(packageJson.dependencies['@fontsource/source-serif-4'], '5.3.0')
  assert.equal(packageJson.dependencies['@fontsource/source-sans-3'], '5.3.0')
  assert.ok(packageJson.files.includes('THIRD_PARTY_NOTICES.md'))
  assert.match(themeCss, /--tulip-reference-serif:\s*'Source Serif 4'/)
  assert.match(themeCss, /--tulip-sans:\s*'Source Sans 3'/)
  assert.match(referencesLayout, /tulip-references--balanced/)
  assert.match(referencesLayout, /tulip-references--two-columns/)
  assert.match(gallery, /balanced: true[\s\S]*columns: 2/)
})

test('keeps balanced content and staged switches intrinsic and stable', () => {
  assert.match(themeCss, /\.slidev-layout\.tulip-balanced[\s\S]*grid-template-rows:\s*minmax\(0, 1fr\) auto/)
  assert.match(themeCss, /\.tulip-balanced-content\.tulip-switch\s*\{[\s\S]*?margin:\s*0/)
  assert.match(themeCss, /\.tulip-fill-grid\s*\{[\s\S]*?height:\s*100%/)
  assert.match(themeCss, /\.tulip-switch\s*\{[\s\S]*?grid-template-columns:/)
  assert.match(themeCss, /\.tulip-switch-rail\s*\{[\s\S]*?grid-auto-rows:\s*minmax\(0, 1fr\)/)
  assert.match(themeCss, /\.tulip-switch-stage\s*\{[\s\S]*?overflow:\s*hidden/)
})

test('documents the semantic visual and navigation naming contracts', () => {
  assert.match(contract, /## Semantic visuals/)
  assert.match(contractProse, /visibly label the source or input/)
  assert.match(contractProse, /visibly label the transformation, filter, comparison, or decision/)
  assert.match(contractProse, /visibly label the outcome/)
  assert.match(contractProse, /An `aria-label` supports accessibility but does not replace labels that the audience can see/)
  assert.match(contract, /## Section, session, and title hierarchy/)
  assert.match(contractProse, /`section` is the stable navigation category/)
  assert.match(contractProse, /`sessionTitle` is a concise recurring navigation label/)
  assert.match(contractProse, /The H1 is the slide's assertion, question, or narrative headline/)
})

test('documents projection checks and the limits of automated review', () => {
  assert.match(contractProse, /must not be smaller than `--tulip-caption-size`/)
  assert.match(contractProse, /white surfaces on a white canvas/)
  assert.match(contractProse, /They cannot prove that a diagram communicates the intended meaning/)
  assert.match(readme, /pnpm check:visual/)
  assert.match(readme, /pnpm check:deck-visual/)
  assert.match(readme, /pnpm update:visual/)
})

test('gallery exercises semantic aliases, typography roles, and light evidence', () => {
  for (const className of ['tulip-card--risk', 'tulip-card--warning', 'tulip-card--outcome', 'tulip-body', 'tulip-supporting', 'tulip-caption', 'tulip-label', 'tulip-evidence-panel'])
    assert.match(gallery, new RegExp(`class="[^"]*${className}`))
})

test('ships a visibly labelled semantic evidence fixture without promoting a diagram API', () => {
  assert.match(gallery, /data-semantic-role="source"[\s\S]*>SOURCE</)
  assert.match(gallery, /data-semantic-role="process"[\s\S]*>TRANSFORMATION</)
  assert.match(gallery, /data-semantic-role="outcome"[\s\S]*>OUTCOME</)
  assert.match(gallery, /<strong>Included:<\/strong>/)
  assert.match(gallery, /<strong>Excluded:<\/strong>/)
  assert.doesNotMatch(themeCss, /\.tulip-flow-/)
})
