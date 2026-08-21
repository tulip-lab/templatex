import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildDeckSections,
  findActiveItem,
  formatSectionLabel,
  getProgressPercentage,
  getShellVisibility,
  navigableDeckSections,
  splitSectionsForToc,
  visibleDeckSections,
} from '../utils/deckNavigation.ts'

const routes = [
  { no: 1, frontmatter: {} },
  { no: 2, frontmatter: { navigation: 'toc' } },
  { no: 3, frontmatter: { section: 'Research Context', block: 1 } },
  { no: 4, frontmatter: { session: '1A', sessionTitle: 'Question' } },
  { no: 5, frontmatter: { session: '1B', sessionTitle: 'Evidence' } },
  { no: 6, frontmatter: { section: 'Working Patterns', block: 2 } },
  { no: 7, frontmatter: { session: '2A', sessionTitle: 'Walking' } },
  { no: 8, frontmatter: { session: '2B', sessionTitle: 'Working' } },
  { no: 9, frontmatter: { section: 'Closing', block: 3 } },
]

test('builds ordered sections and attaches sessions to their current section', () => {
  const sections = buildDeckSections(routes)

  assert.deepEqual(
    sections.map(section => ({
      label: section.label,
      block: section.block,
      page: section.page,
      sessions: section.sessions.map(session => session.code),
    })),
    [
      { label: 'Research Context', block: '1', page: 3, sessions: ['1A', '1B'] },
      { label: 'Working Patterns', block: '2', page: 6, sessions: ['2A', '2B'] },
      { label: 'Closing', block: '3', page: 9, sessions: [] },
    ],
  )
})

test('formats numbered section labels and finds the active item', () => {
  const sections = buildDeckSections(routes)

  assert.equal(formatSectionLabel(sections[0]), '1 Research Context')
  assert.equal(findActiveItem(sections, 1), undefined)
  assert.equal(findActiveItem(sections, 5)?.session?.code, '1B')
  assert.equal(findActiveItem(sections, 6)?.section.label, 'Working Patterns')
  assert.equal(findActiveItem(sections, 6)?.session, undefined)
})

test('ignores empty labels and sessions before the first section', () => {
  const sections = buildDeckSections([
    { no: 1, frontmatter: { session: '0A', sessionTitle: 'Ignored' } },
    { no: 2, frontmatter: { section: '  ' } },
    { no: 3, frontmatter: { section: 'Overview' } },
    { no: 4, frontmatter: { session: ' ', sessionTitle: 'Ignored' } },
  ])

  assert.deepEqual(sections.map(section => section.label), ['Overview'])
  assert.deepEqual(sections[0].sessions, [])
})

test('splits sections into ordered balanced TOC columns', () => {
  const sections = buildDeckSections(routes)
  const [left, right] = splitSectionsForToc(sections)

  assert.deepEqual([...left, ...right], sections)
  assert.ok(left.length > 0)
  assert.ok(right.length > 0)
  assert.deepEqual(splitSectionsForToc([sections[0]]), [[sections[0]], []])
})

test('keeps hidden sections available for location while excluding them from navigation', () => {
  const sections = buildDeckSections([
    { no: 1, frontmatter: { section: 'Main' } },
    { no: 2, frontmatter: { section: 'Closing', toc: false } },
  ])

  assert.equal(findActiveItem(sections, 2)?.section.label, 'Closing')
  assert.deepEqual(visibleDeckSections(sections).map(section => section.label), ['Main'])
  assert.deepEqual(navigableDeckSections(sections).map(section => section.label), ['Main'])
})

test('can keep a section in the table of contents while hiding it from bottom navigation', () => {
  const sections = buildDeckSections([
    { no: 1, frontmatter: { section: 'Main' } },
    { no: 2, frontmatter: { section: 'References', navigation: false } },
  ])

  assert.deepEqual(visibleDeckSections(sections).map(section => section.label), ['Main', 'References'])
  assert.deepEqual(navigableDeckSections(sections).map(section => section.label), ['Main'])
})

test('applies the shell visibility contract', () => {
  assert.deepEqual(getShellVisibility('cover', undefined, true), {
    showLocation: false,
    showLogo: false,
    showBottom: false,
  })
  assert.deepEqual(getShellVisibility('toc', 'toc', true), {
    showLocation: false,
    showLogo: true,
    showBottom: true,
  })
  assert.equal(getShellVisibility('default', undefined, true).showLocation, true)
  assert.equal(getShellVisibility('default', undefined, false).showLocation, false)
})

test('clamps deck progress and handles an empty deck', () => {
  assert.equal(getProgressPercentage(5, 10), 50)
  assert.equal(getProgressPercentage(20, 10), 100)
  assert.equal(getProgressPercentage(-1, 10), 0)
  assert.equal(getProgressPercentage(1, 0), 0)
})
