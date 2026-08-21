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
    course: 'TULIP Lab Talks',
    author: 'Researcher Name',
    affiliation: 'University Name',
    authorPhoto: '/speaker.png',
  }), {
    title: 'Walking and Working with AI',
    subtitle: 'A research talk',
    course: 'TULIP Lab Talks',
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
  assert.match(coverLayout, /frontmatter\?\.layout === 'contact'/)
  assert.match(coverLayout, /aria-label="Go to contact slide"/)
  assert.doesNotMatch(coverLayout, /Stay Connected/)
})
