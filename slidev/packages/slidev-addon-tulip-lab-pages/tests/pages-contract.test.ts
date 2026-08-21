import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const layouts = [
  'tulip-speaker',
  'tulip-deakin',
  'tulip-deakin-rankings',
  'tulip-academy',
  'tulip-questions',
  'tulip-contact',
]

test('publishes the canonical TULIP Lab pages addon', () => {
  assert.equal(packageJson.name, 'slidev-addon-tulip-lab-pages')
  assert.equal(packageJson.version, '0.2.0')

  for (const name of layouts)
    assert.ok(existsSync(new URL(`../layouts/${name}.vue`, import.meta.url)), `missing ${name} layout`)
})

test('ships fallback media and keeps deck content configurable', () => {
  for (const name of ['gangli-photo.jpg', 'tulip-logo.png', 'questions.gif'])
    assert.ok(existsSync(new URL(`../assets/${name}`, import.meta.url)), `missing ${name}`)

  const contact = readFileSync(new URL('../layouts/tulip-contact.vue', import.meta.url), 'utf8')
  const speaker = readFileSync(new URL('../layouts/tulip-speaker.vue', import.meta.url), 'utf8')
  const academy = readFileSync(new URL('../layouts/tulip-academy.vue', import.meta.url), 'utf8')
  const questions = readFileSync(new URL('../layouts/tulip-questions.vue', import.meta.url), 'utf8')
  assert.match(contact, /config\.value\.email/)
  assert.match(contact, /config\.value\.website/)
  assert.match(contact, /config\.value\.websiteLabel/)
  assert.match(contact, /config\.value\.contactLogo/)
  assert.match(speaker, /config\.value\.speakerPhoto/)
  assert.match(speaker, /config\.value\.speakerHighlights/)
  assert.match(academy, /config\.value\.academyLinks/)
  assert.match(academy, /config\.value\.academyResearchAreas/)
  assert.match(academy, /\$clicks >= index \+ 1/)
  assert.match(academy, /\['slide', 'presenter'\]/)
  assert.match(questions, /config\.value\.questionsImage/)
})

test('documents the canonical shared-page section and session structure', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')

  assert.match(readme, /section: TULIP Lab\ntocExpand: false\nsession: Gang Li/)
  assert.match(readme, /session: Deakin/)
  assert.match(readme, /session: TULIP Lab/)
  assert.match(readme, /section: Closing\ntocExpand: false\nsession: Questions\nnavigation: false/)
  assert.match(readme, /session: Contact/)
})
