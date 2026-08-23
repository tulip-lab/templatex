import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { asCollaborationRegions, resolvePublicAssetPath } from '../utils/config'

test('ships the interactive collaboration layout', () => {
  const layoutUrl = new URL('../layouts/tulip-collaborations.vue', import.meta.url)
  assert.ok(existsSync(layoutUrl), 'missing tulip-collaborations layout')

  const layout = readFileSync(layoutUrl, 'utf8')
  assert.match(layout, /props\.regions/)
  assert.match(layout, /\$clicks\.value/)
  assert.match(layout, /resolvePublicAssetPath\(src/)
})

test('normalizes collaboration regions and photo options', () => {
  const regions = asCollaborationRegions([
    {
      name: 'South Korea',
      label: 'East Asia',
      institutions: ['Chonnam National University'],
      photoLayout: 'portrait-feature',
      photos: [
        { src: '/collaborations/seminar.jpg', alt: 'Invited seminar', fit: 'contain' },
        { src: 'https://example.com/group.jpg', alt: 'Research group', fit: 'unsupported' },
      ],
    },
  ])

  assert.deepEqual(regions, [{
    name: 'South Korea',
    label: 'East Asia',
    institutions: ['Chonnam National University'],
    photoLayout: 'portrait-feature',
    photos: [
      { src: '/collaborations/seminar.jpg', alt: 'Invited seminar', fit: 'contain' },
      { src: 'https://example.com/group.jpg', alt: 'Research group', fit: undefined },
    ],
  }])
  assert.equal(resolvePublicAssetPath('/collaborations/seminar.jpg', '/courses/demo/live/'), '/courses/demo/live/collaborations/seminar.jpg')
})
