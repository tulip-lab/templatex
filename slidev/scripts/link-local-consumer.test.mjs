import assert from 'node:assert/strict'
import { lstat, mkdir, mkdtemp, readFile, readlink, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { checkConsumer, linkConsumer, parseArguments, restoreConsumer } from './link-local-consumer.mjs'

const packageNames = ['slidev-theme-tulip-lab', 'slidev-addon-tulip-lab-pages']

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'tulip-local-consumer-test-'))
  const consumer = join(root, 'consumer')
  const registry = join(root, 'registry')
  const sourceRoot = join(root, 'source')
  const sources = new Map()

  await mkdir(join(consumer, 'node_modules'), { recursive: true })
  await writeFile(join(consumer, 'package.json'), `${JSON.stringify({
    dependencies: Object.fromEntries(packageNames.map(name => [name, '0.2.2'])),
  }, null, 2)}\n`)
  await writeFile(join(consumer, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n')
  await writeFile(join(consumer, 'pnpm-workspace.yaml'), 'shamefullyHoist: true\n')

  for (const name of packageNames) {
    const published = join(registry, name)
    const source = join(sourceRoot, name)
    await mkdir(published, { recursive: true })
    await mkdir(source, { recursive: true })
    await writeFile(join(source, 'package.json'), `${JSON.stringify({ name, version: '0.2.2' })}\n`)
    await symlink(published, join(consumer, 'node_modules', name), 'dir')
    sources.set(name, source)
  }

  const pages = sources.get('slidev-addon-tulip-lab-pages')
  for (const asset of ['deakin-mark.png', 'gangli-photo.jpg', 'tulip-logo.png']) {
    await mkdir(join(pages, 'assets'), { recursive: true })
    await writeFile(join(pages, 'assets', asset), asset)
  }

  return { consumer, root, sources }
}

test('parses link, check, and restore modes', () => {
  assert.equal(parseArguments(['/deck']).mode, 'link')
  assert.equal(parseArguments(['--', '--check', '/deck']).mode, 'check')
  assert.equal(parseArguments(['--restore', '/deck']).mode, 'restore')
  assert.throws(() => parseArguments(['--check', '--restore', '/deck']), /only one/)
  assert.throws(() => parseArguments(['--unknown', '/deck']), /Unknown option/)
  assert.throws(() => parseArguments([]), /consumer deck/)
})

test('links both visual packages without changing consumer configuration and restores them', async (context) => {
  const current = await fixture()
  context.after(() => rm(current.root, { force: true, recursive: true }))
  const protectedNames = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']
  const before = new Map(await Promise.all(protectedNames.map(async name => [name, await readFile(join(current.consumer, name), 'utf8')])))
  const originals = new Map(await Promise.all(packageNames.map(async name => [name, await readlink(join(current.consumer, 'node_modules', name))])))

  const linked = await linkConsumer(current.consumer, { sources: current.sources })
  assert.deepEqual(linked.changed.sort(), [...packageNames].sort())
  assert.equal(linked.alreadyLinked, false)
  await checkConsumer(current.consumer, { sources: current.sources })
  const repeated = await linkConsumer(current.consumer, { sources: current.sources })
  assert.equal(repeated.alreadyLinked, true)
  assert.deepEqual(repeated.changed, [])

  for (const name of packageNames)
    assert.equal(await realpath(join(current.consumer, 'node_modules', name)), await realpath(current.sources.get(name)))
  for (const name of protectedNames)
    assert.equal(await readFile(join(current.consumer, name), 'utf8'), before.get(name))

  const restored = await restoreConsumer(current.consumer)
  assert.deepEqual(restored.sort(), [...packageNames].sort())
  for (const name of packageNames)
    assert.equal(await readlink(join(current.consumer, 'node_modules', name)), originals.get(name))
  await assert.rejects(lstat(join(current.consumer, 'node_modules', '.tulip-local-links.json')), { code: 'ENOENT' })
})

test('check detects a stale package and linking refuses non-symlink dependencies', async (context) => {
  const current = await fixture()
  context.after(() => rm(current.root, { force: true, recursive: true }))

  await assert.rejects(checkConsumer(current.consumer, { sources: current.sources }), /resolves to/)
  const theme = join(current.consumer, 'node_modules', 'slidev-theme-tulip-lab')
  await rm(theme)
  await mkdir(theme)
  await assert.rejects(linkConsumer(current.consumer, { sources: current.sources }), /non-symlink/)
})
