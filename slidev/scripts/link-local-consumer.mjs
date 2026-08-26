import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, readlink, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url))
const metadataName = '.tulip-local-links.json'
const protectedFiles = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'package-lock.json', 'yarn.lock']

export const visualPackages = new Map([
  ['slidev-theme-tulip-lab', 'packages/slidev-theme-tulip-lab'],
  ['slidev-addon-tulip-lab-pages', 'packages/slidev-addon-tulip-lab-pages'],
])

const requiredPagesAssets = [
  'assets/deakin-mark.png',
  'assets/gangli-photo.jpg',
  'assets/tulip-logo.png',
]

export function parseArguments(argv) {
  let consumer = ''
  let mode = 'link'

  for (const argument of argv) {
    if (argument === '--')
      continue
    if (argument === '--check' || argument === '--restore') {
      const nextMode = argument.slice(2)
      if (mode !== 'link')
        throw new Error('Use only one of --check or --restore')
      mode = nextMode
    }
    else if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`)
    }
    else if (!consumer) {
      consumer = argument
    }
    else {
      throw new Error(`Unexpected argument: ${argument}`)
    }
  }

  if (!consumer)
    throw new Error('Provide the consumer deck directory')

  return { consumer: resolve(consumer), mode }
}

function defaultSources() {
  return new Map([...visualPackages].map(([name, path]) => [name, join(workspaceRoot, path)]))
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function optionalDigest(path) {
  try {
    return createHash('sha256').update(await readFile(path)).digest('hex')
  }
  catch (error) {
    if (error?.code === 'ENOENT')
      return null
    throw error
  }
}

async function configurationSnapshot(consumer) {
  return new Map(await Promise.all(protectedFiles.map(async name => [name, await optionalDigest(join(consumer, name))])))
}

async function assertConfigurationUnchanged(consumer, before) {
  const after = await configurationSnapshot(consumer)
  const changed = [...before].filter(([name, digest]) => after.get(name) !== digest).map(([name]) => name)
  if (changed.length)
    throw new Error(`Transient linking changed tracked consumer configuration: ${changed.join(', ')}`)
}

async function pathState(path) {
  try {
    return await lstat(path)
  }
  catch (error) {
    if (error?.code === 'ENOENT')
      return null
    throw error
  }
}

async function loadContext(consumer, sources = defaultSources()) {
  const manifestPath = join(consumer, 'package.json')
  const manifest = await readJson(manifestPath)
  const dependencies = { ...manifest.devDependencies, ...manifest.dependencies }
  const packages = []

  for (const [name] of visualPackages) {
    if (typeof dependencies[name] !== 'string')
      throw new Error(`Consumer package.json must declare "${name}"`)

    const source = resolve(sources.get(name) ?? '')
    const sourceManifest = await readJson(join(source, 'package.json'))
    if (sourceManifest.name !== name)
      throw new Error(`Local source for "${name}" has package name "${sourceManifest.name ?? ''}"`)
    if (typeof sourceManifest.version !== 'string' || !sourceManifest.version)
      throw new Error(`Local source for "${name}" must declare a version`)

    packages.push({
      installed: join(consumer, 'node_modules', name),
      name,
      source: await realpath(source),
      version: sourceManifest.version,
    })
  }

  if (new Set(packages.map(item => item.version)).size !== 1)
    throw new Error('Local Theme and pages addon must use the same version')

  const pages = packages.find(item => item.name === 'slidev-addon-tulip-lab-pages')
  for (const asset of requiredPagesAssets) {
    if (!await pathState(join(pages.source, asset)))
      throw new Error(`Local pages addon is missing required media: ${asset}`)
  }

  return { consumer, packages }
}

async function installedLink(item) {
  const state = await pathState(item.installed)
  if (!state)
    throw new Error(`Installed dependency is missing: ${item.installed}. Run pnpm install first.`)
  if (!state.isSymbolicLink())
    throw new Error(`Refusing to replace non-symlink dependency: ${item.installed}`)

  let resolved
  try {
    resolved = await realpath(item.installed)
  }
  catch (error) {
    throw new Error(`Installed dependency link cannot be resolved: ${item.installed} (${error.message})`)
  }

  return { rawTarget: await readlink(item.installed), resolved }
}

async function replaceSymlink(path, target) {
  const temporary = `${path}.tulip-link-${process.pid}`
  await rm(temporary, { force: true })
  await symlink(target, temporary, 'dir')
  await rename(temporary, path)
}

async function readMetadata(consumer) {
  const path = join(consumer, 'node_modules', metadataName)
  try {
    return { path, value: await readJson(path) }
  }
  catch (error) {
    if (error?.code === 'ENOENT')
      return { path, value: null }
    throw error
  }
}

export async function checkConsumer(consumer, { sources = defaultSources() } = {}) {
  const context = await loadContext(resolve(consumer), sources)
  const details = []
  const errors = []

  for (const item of context.packages) {
    const current = await installedLink(item)
    details.push({ ...item, resolved: current.resolved })
    if (current.resolved !== item.source)
      errors.push(`${item.name} resolves to ${current.resolved}, expected ${item.source}`)
  }

  if (errors.length)
    throw new Error(errors.join('\n'))

  return details
}

export async function linkConsumer(consumer, { sources = defaultSources() } = {}) {
  const root = resolve(consumer)
  const before = await configurationSnapshot(root)
  const context = await loadContext(root, sources)
  const metadata = await readMetadata(root)
  const current = new Map()

  for (const item of context.packages)
    current.set(item.name, await installedLink(item))

  if (metadata.value) {
    await checkConsumer(root, { sources })
    await assertConfigurationUnchanged(root, before)
    return { alreadyLinked: true, changed: [], details: context.packages }
  }

  const changed = context.packages.filter(item => current.get(item.name).resolved !== item.source)
  if (!changed.length) {
    await assertConfigurationUnchanged(root, before)
    return { alreadyLinked: true, changed: [], details: context.packages }
  }

  const record = {
    packages: Object.fromEntries(context.packages.map(item => [item.name, {
      managed: changed.some(entry => entry.name === item.name),
      originalTarget: current.get(item.name).rawTarget,
      source: item.source,
    }])),
    version: 1,
  }

  try {
    for (const item of changed)
      await replaceSymlink(item.installed, item.source)

    await mkdir(dirname(metadata.path), { recursive: true })
    await writeFile(metadata.path, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx' })
    const details = await checkConsumer(root, { sources })
    await assertConfigurationUnchanged(root, before)
    return { alreadyLinked: false, changed: changed.map(item => item.name), details }
  }
  catch (error) {
    for (const item of changed) {
      const original = current.get(item.name)
      const state = await pathState(item.installed)
      if (state?.isSymbolicLink())
        await replaceSymlink(item.installed, original.rawTarget)
    }
    await rm(metadata.path, { force: true })
    throw error
  }
}

export async function restoreConsumer(consumer) {
  const root = resolve(consumer)
  const before = await configurationSnapshot(root)
  const metadata = await readMetadata(root)
  if (!metadata.value)
    throw new Error(`No ${metadataName} restoration record exists for this consumer`)
  if (metadata.value.version !== 1 || !metadata.value.packages)
    throw new Error(`Unsupported ${metadataName} format`)

  const managed = []
  for (const [name] of visualPackages) {
    const record = metadata.value.packages[name]
    if (!record)
      throw new Error(`Restoration record is missing "${name}"`)
    if (!record.managed)
      continue

    const installed = join(root, 'node_modules', name)
    const state = await pathState(installed)
    if (!state?.isSymbolicLink())
      throw new Error(`Refusing to restore changed non-symlink dependency: ${installed}`)
    const resolved = await realpath(installed)
    if (resolved !== record.source)
      throw new Error(`Refusing to overwrite drifted dependency: ${name} resolves to ${resolved}`)
    managed.push({ installed, name, ...record })
  }

  for (const item of managed)
    await replaceSymlink(item.installed, item.originalTarget)

  await rm(metadata.path)
  await assertConfigurationUnchanged(root, before)
  return managed.map(item => item.name)
}

function printDetails(details) {
  for (const item of details)
    console.log(`${item.name}@${item.version} -> ${item.resolved ?? item.source}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { consumer, mode } = parseArguments(process.argv.slice(2))
    if (mode === 'check') {
      const details = await checkConsumer(consumer)
      printDetails(details)
      console.log('Local TULIP visual packages are linked correctly.')
    }
    else if (mode === 'restore') {
      const restored = await restoreConsumer(consumer)
      console.log(`Restored ${restored.length ? restored.join(', ') : 'no tool-managed package links'}.`)
    }
    else {
      const result = await linkConsumer(consumer)
      printDetails(result.details)
      console.log(result.alreadyLinked
        ? 'Local TULIP visual packages were already linked.'
        : `Linked ${result.changed.join(', ')}.`)
      console.log('Restart Slidev with --force, then run the consumer production build.')
    }
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
