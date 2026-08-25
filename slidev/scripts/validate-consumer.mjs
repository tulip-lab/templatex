import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url))
const packageStore = join(tmpdir(), 'tulip-slidev-pnpm-store')
const localPackages = new Map([
  ['slidev-theme-tulip-lab', 'packages/slidev-theme-tulip-lab'],
  ['slidev-addon-tulip-lab-pages', 'packages/slidev-addon-tulip-lab-pages'],
  ['slidev-addon-tulip-lab-live', 'packages/slidev-addon-tulip-lab-live'],
  ['tulip-slidev-check', 'packages/tulip-slidev-check'],
])
const ignoredDirectories = new Set(['.git', '.playwright-cli', '.slidev', 'dist', 'node_modules', 'output'])

export function parseArguments(argv) {
  let profile = ''
  let keep = false
  let consumer = ''
  const includeArguments = []

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') {
      continue
    }
    if (argument === '--profile') {
      profile = argv[index + 1] ?? ''
      index += 1
    }
    else if (argument === '--keep') {
      keep = true
    }
    else if (argument === '--include') {
      const includePath = argv[index + 1]
      if (!includePath || includePath.startsWith('--'))
        throw new Error('--include requires a path')
      includeArguments.push(includePath)
      index += 1
    }
    else if (!consumer) {
      consumer = argument
    }
    else {
      throw new Error(`Unexpected argument: ${argument}`)
    }
  }

  if (!['course', 'talk'].includes(profile))
    throw new Error('Use --profile course or --profile talk')
  if (!consumer)
    throw new Error('Provide the consumer deck directory')

  const resolvedConsumer = resolve(consumer)
  return {
    consumer: resolvedConsumer,
    includes: includeArguments.map(includePath => resolve(resolvedConsumer, includePath)),
    keep,
    profile,
  }
}

export function declaredLocalPackages(manifest) {
  const names = new Set()

  for (const dependencyGroup of ['dependencies', 'devDependencies']) {
    const dependencies = manifest[dependencyGroup]
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies))
      continue

    for (const name of localPackages.keys()) {
      if (typeof dependencies[name] === 'string')
        names.add(name)
    }
  }

  if (!names.size)
    throw new Error('Consumer does not declare any TULIP Slidev packages')

  return [...names]
}

export function usePackedPackages(manifest, archives) {
  const updated = structuredClone(manifest)
  let replacements = 0

  for (const dependencyGroup of ['dependencies', 'devDependencies']) {
    const dependencies = updated[dependencyGroup]
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies))
      continue

    for (const [name, packagePath] of localPackages) {
      if (typeof dependencies[name] !== 'string')
        continue

      const archive = archives.get(name)
      if (!archive)
        throw new Error(`Missing packed archive for ${name} (${packagePath})`)

      dependencies[name] = `file:${archive}`
      replacements += 1
    }
  }

  if (!replacements)
    throw new Error('Consumer does not declare any TULIP Slidev packages')

  return updated
}

async function packLocalPackages(names, destination) {
  await mkdir(destination, { recursive: true })
  const archives = new Map()

  for (const name of names) {
    const packageDirectory = join(workspaceRoot, localPackages.get(name))
    const archive = join(destination, `${name}.tgz`)
    await run('pnpm', ['pack', '--out', archive], packageDirectory)
    archives.set(name, archive)
  }

  return archives
}

function run(command, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', code => code === 0
      ? resolvePromise()
      : reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`)))
  })
}

async function copyConsumer(source, destination) {
  await cp(source, destination, {
    dereference: true,
    recursive: true,
    filter(path) {
      const pathFromRoot = relative(source, path)
      return !pathFromRoot.split(sep).some(segment => ignoredDirectories.has(segment))
    },
  })
}

async function copyIncludes(consumer, temporaryDeck, includes) {
  const sourceParent = dirname(consumer)
  const destinationParent = dirname(temporaryDeck)

  for (const source of includes) {
    const pathFromParent = relative(sourceParent, source)
    if (!pathFromParent || isAbsolute(pathFromParent) || pathFromParent.split(sep).includes('..'))
      throw new Error(`Included path must be outside the deck but within ${sourceParent}: ${source}`)

    await cp(source, join(destinationParent, pathFromParent), {
      dereference: true,
      recursive: true,
      filter(path) {
        const pathFromRoot = relative(source, path)
        return !pathFromRoot.split(sep).some(segment => ignoredDirectories.has(segment))
      },
    })
  }
}

export async function validateConsumer({ consumer, includes = [], keep, profile }) {
  const sourceManifest = JSON.parse(await readFile(join(consumer, 'package.json'), 'utf8'))
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'tulip-slidev-consumer-'))
  const temporaryDeck = join(temporaryRoot, basename(consumer))

  try {
    await copyConsumer(consumer, temporaryDeck)
    await copyIncludes(consumer, temporaryDeck, includes)
    const packageNames = declaredLocalPackages(sourceManifest)
    const archives = await packLocalPackages(packageNames, join(temporaryRoot, 'packages'))
    const localManifest = usePackedPackages(sourceManifest, archives)
    await writeFile(join(temporaryDeck, 'package.json'), `${JSON.stringify(localManifest, null, 2)}\n`)

    console.log(`Validating ${consumer} with packed local TULIP packages in ${temporaryDeck}`)
    await run('pnpm', ['install', '--no-frozen-lockfile', '--lockfile=false', '--store-dir', packageStore], temporaryDeck)
    await run('pnpm', ['exec', 'tulip-slidev-check', '--profile', profile, '.'], temporaryDeck)
    await run('pnpm', ['exec', 'slidev', 'build', '--out', 'dist'], temporaryDeck)
    console.log(`Consumer validation passed: ${consumer}`)
  }
  finally {
    if (keep)
      console.log(`Kept isolated consumer copy: ${temporaryDeck}`)
    else
      await rm(temporaryRoot, { force: true, recursive: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await validateConsumer(parseArguments(process.argv.slice(2)))
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
