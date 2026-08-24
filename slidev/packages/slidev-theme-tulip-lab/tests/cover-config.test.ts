import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { normaliseCoverConfig, resolvePublicAssetPath } from '../utils/coverConfig.ts'

const coverLayout = readFileSync(new URL('../layouts/cover.vue', import.meta.url), 'utf8')
const sharedPublicImage = readFileSync(new URL('../components/SharedPublicImage.vue', import.meta.url), 'utf8')

test('normalises configured presentation metadata', () => {
  assert.deepEqual(normaliseCoverConfig({
    title: 'Walking and Working with AI',
    subtitle: 'A research talk',
    course: 'TULIP Lab Research Series',
    author: 'Researcher Name',
    affiliation: 'University Name',
    authorPhoto: '/speaker.png',
  }), {
    title: 'Walking and Working with AI',
    subtitle: 'A research talk',
    course: 'TULIP Lab Research Series',
    author: 'Researcher Name',
    affiliation: 'University Name',
    authorPhoto: '/speaker.png',
  })
})

test('uses neutral defaults and omits an invalid author photo', () => {
  const cover = normaliseCoverConfig({ title: '  ', authorPhoto: 42 })

  assert.equal(cover.title, 'Presentation Title')
  assert.equal(cover.course, 'TULIP Lab')
  assert.equal(cover.authorPhoto, undefined)
})

test('resolves root public assets under the configured Slidev base path', () => {
  assert.equal(resolvePublicAssetPath('/speaker.png', '/talk/'), '/talk/speaker.png')
  assert.equal(resolvePublicAssetPath('/speaker.png', '/'), '/speaker.png')
  assert.equal(resolvePublicAssetPath('https://example.com/photo.png', '/talk/'), 'https://example.com/photo.png')
})

test('resolves shared public images against the active deck base path', () => {
  assert.match(sharedPublicImage, /resolvePublicAssetPath/)
  assert.match(sharedPublicImage, /import\.meta\.env\.BASE_URL/)
})

test('links the portrait to the contact layout without depending on its title', () => {
  assert.match(coverLayout, /layout === 'contact' \|\| layout === 'tulip-contact'/)
  assert.match(coverLayout, /aria-label="Go to contact slide"/)
  assert.doesNotMatch(coverLayout, /Stay Connected/)
})

test('links the cover title to the table of contents', () => {
  assert.match(coverLayout, /frontmatter\?\.layout === 'toc' \|\| frontmatter\?\.navigation === 'toc'/)
  assert.match(coverLayout, /aria-label="Open table of contents"/)
  assert.match(coverLayout, /@click="nav\.go\(tocPage\)"/)
})

test('uses the packaged Gang Li portrait unless a deck overrides it', () => {
  assert.match(coverLayout, /import gangLiPhoto/)
  assert.match(coverLayout, /cover\.value\.author\.includes\('Gang Li'\)/)
  assert.match(coverLayout, /if \(configured\)/)
})
