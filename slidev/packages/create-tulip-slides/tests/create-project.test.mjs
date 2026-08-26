import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createProject, PACKAGE_VERSIONS } from '../src/create-project.mjs'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')

async function temporaryTarget(name) {
  const parent = await mkdtemp(join(tmpdir(), 'create-tulip-slides-'))
  return join(parent, name)
}

async function manifest(target) {
  return JSON.parse(await readFile(join(target, 'package.json'), 'utf8'))
}

function assertSharedPageSessions(slides, { acknowledgements = false } = {}) {
  assert.match(slides, /layout: tulip-speaker\nsection: TULIP Lab\ntocExpand: false\nsession: Gang Li/)
  assert.match(slides, /layout: tulip-deakin\nsession: Deakin/)
  assert.match(slides, /layout: tulip-deakin-rankings[\s\S]*layout: tulip-academy\nsession: TULIP Lab/)
  if (acknowledgements)
    assert.match(slides, /layout: tulip-lab-acknowledgements\nnavigation: false\npeople: \[\]\n---[\s\S]*?layout: toc/)
  assert.match(slides, /layout: tulip-questions\nsection: Closing\ntocExpand: false\nsession: Questions\nnavigation: false/)
  assert.match(slides, /layout: tulip-contact\ntitle: Contact\nsession: Contact/)
}

test('documents the current creator release', () => {
  assert.ok(readme.includes(`create-tulip-slides@${packageJson.version}`))
  assert.equal(packageJson.bin['create-tulip-slides'], 'bin/create-tulip-slides.mjs')
})

test('creates a Course with exact versions and the standard addons', async () => {
  const target = await temporaryTarget('Example Course')
  const result = await createProject('course', target)
  const packageJson = await manifest(target)
  const slides = await readFile(join(target, 'slides.md'), 'utf8')

  assert.equal(result.target, target)
  assert.equal(packageJson.name, 'example-course')
  assert.equal(packageJson.scripts.check, 'tulip-slidev-check --profile course .')
  assert.equal(packageJson.dependencies['slidev-addon-tulip-lab-live'], PACKAGE_VERSIONS['slidev-addon-tulip-lab-live'])
  assert.equal(packageJson.dependencies['slidev-addon-tulip-lab-pages'], PACKAGE_VERSIONS['slidev-addon-tulip-lab-pages'])
  assert.equal(packageJson.dependencies['slidev-theme-tulip-lab'], PACKAGE_VERSIONS['slidev-theme-tulip-lab'])
  assert.equal(packageJson.dependencies['tulip-slidev-check'], PACKAGE_VERSIONS['tulip-slidev-check'])
  assert.match(slides, /slidev-addon-tulip-lab-live/)
  assert.match(slides, /slidev-addon-tulip-lab-pages/)
  assertSharedPageSessions(slides)
  assert.match(await readFile(join(target, 'TEMPLATE-LICENSE.md'), 'utf8'), /CC BY 4\.0/)
})

test('creates a Talk without live synchronization by default', async () => {
  const target = await temporaryTarget('Research Talk')
  await mkdir(target)
  await createProject('talk', target)
  const packageJson = await manifest(target)
  const slides = await readFile(join(target, 'slides.md'), 'utf8')

  assert.equal(packageJson.scripts.check, 'tulip-slidev-check --profile talk .')
  assert.equal(packageJson.dependencies['slidev-addon-tulip-lab-live'], undefined)
  assert.equal(packageJson.dependencies['slidev-addon-tulip-lab-pages'], PACKAGE_VERSIONS['slidev-addon-tulip-lab-pages'])
  assert.doesNotMatch(slides, /slidev-addon-tulip-lab-live/)
  assert.match(slides, /slidev-addon-tulip-lab-pages/)
  assertSharedPageSessions(slides, { acknowledgements: true })
})

test('refuses to overwrite a non-empty target', async () => {
  const target = await temporaryTarget('existing')
  await mkdir(target)
  await writeFile(join(target, 'keep.txt'), 'preserve me\n')

  await assert.rejects(() => createProject('talk', target), /target directory is not empty/)
  assert.equal(await readFile(join(target, 'keep.txt'), 'utf8'), 'preserve me\n')
})

test('bundled templates match the workspace source templates', async () => {
  for (const profile of ['course', 'talk']) {
    for (const file of ['README.md', 'slides.md']) {
      const bundled = await readFile(new URL(`../templates/${profile}/${file}`, import.meta.url), 'utf8')
      const source = await readFile(new URL(`../../../templates/${profile}/${file}`, import.meta.url), 'utf8')
      assert.equal(bundled, source, `${profile}/${file} is out of sync`)
    }
  }
})

test('requires a supported profile', async () => {
  const target = await temporaryTarget('invalid')

  await assert.rejects(() => createProject('workshop', target), /profile must be/)
})
