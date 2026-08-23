import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { normaliseAcknowledgementPeople } from '../utils/acknowledgements'

test('ships the theme-owned acknowledgement layout', () => {
  const layoutUrl = new URL('../layouts/tulip-lab-acknowledgements.vue', import.meta.url)
  assert.ok(existsSync(layoutUrl), 'missing tulip-lab-acknowledgements layout')

  const layout = readFileSync(layoutUrl, 'utf8')
  assert.match(layout, /props\.people/)
  assert.match(layout, /resolvePublicAssetPath\(photo/)
  assert.match(layout, /defaultLogo/)
})

test('keeps only complete acknowledgement records', () => {
  assert.deepEqual(normaliseAcknowledgementPeople([
    { name: 'Dr Example', affiliation: 'Example University', photo: '/acknowledgements/example.jpg' },
    { name: 'Missing Photo', affiliation: 'Example University' },
  ]), [{
    name: 'Dr Example',
    affiliation: 'Example University',
    photo: '/acknowledgements/example.jpg',
  }])
})
