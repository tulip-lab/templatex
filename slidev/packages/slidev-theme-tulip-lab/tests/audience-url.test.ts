import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAudienceUrl } from '../utils/audienceUrl.ts'

test('resolves each deployed deck base as its audience URL', () => {
  assert.equal(
    resolveAudienceUrl('/course-introduction/', 'https://slides.tulip.academy'),
    'https://slides.tulip.academy/course-introduction/',
  )
  assert.equal(
    resolveAudienceUrl('/walking-with-ai/', 'https://slides.tulip.academy/'),
    'https://slides.tulip.academy/walking-with-ai/',
  )
})

test('supports local previews and the root base path', () => {
  assert.equal(resolveAudienceUrl('/', 'http://localhost:3030'), 'http://localhost:3030/')
  assert.equal(resolveAudienceUrl(' /pattern-classification/ ', 'http://127.0.0.1:4173/'), 'http://127.0.0.1:4173/pattern-classification/')
})

test('accepts an explicit deployed Live audience URL', () => {
  assert.equal(
    resolveAudienceUrl(
      '/courses/agentic-ai/m01/live/',
      'https://slides.tulip.academy',
    ),
    'https://slides.tulip.academy/courses/agentic-ai/m01/live/',
  )
  assert.equal(
    resolveAudienceUrl(
      'https://presentations.example.org/talks/walking-and-working-with-ai/live/',
      'http://localhost:3030',
    ),
    'https://presentations.example.org/talks/walking-and-working-with-ai/live/',
  )
})
