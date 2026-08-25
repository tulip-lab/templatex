import assert from 'node:assert/strict'
import test from 'node:test'
import { buildContactSheet, parseArgs } from './check-deck-visual.mjs'
import { compareSwitchGeometry } from './visual-audit.mjs'

test('parses a deck path and optional audit paths', () => {
  assert.deepEqual(parseArgs(['--', '/tmp/deck']), {
    deck: '/tmp/deck', entry: 'slides.md', output: '', url: '',
  })
  assert.deepEqual(parseArgs(['--entry', 'talk.md', '--output', '/tmp/report', '--url', 'http://127.0.0.1:3030', '/tmp/deck']), {
    deck: '/tmp/deck', entry: 'talk.md', output: '/tmp/report', url: 'http://127.0.0.1:3030',
  })
  assert.throws(() => parseArgs(['--unknown', '/tmp/deck']), /Unknown option/)
})

test('reports switch movement above the stable geometry tolerance', () => {
  const states = [
    { click: 0, geometry: { stage: { x: 1, y: 2, width: 300, height: 200 } } },
    { click: 1, geometry: { stage: { x: 1, y: 2, width: 310, height: 200 } } },
  ]
  assert.equal(compareSwitchGeometry(states).length, 1)
  assert.equal(compareSwitchGeometry([{ ...states[0] }, { click: 1, geometry: { stage: { x: 2, y: 2, width: 301, height: 200 } } }]).length, 0)
})

test('builds a contact sheet with escaped metadata and severity labels', () => {
  const html = buildContactSheet({
    deck: '/tmp/<deck>',
    summary: { states: 1, errors: 1, warnings: 0, humanReview: 0 },
    states: [{ slide: 1, click: 0, layout: 'default', title: '<Title>', screenshot: 'screenshots/1.png', findings: [{ severity: 'error', code: 'overflow' }] }],
  })
  assert.match(html, /&lt;deck&gt;/)
  assert.match(html, /&lt;Title&gt;/)
  assert.match(html, /error: overflow/)
})
