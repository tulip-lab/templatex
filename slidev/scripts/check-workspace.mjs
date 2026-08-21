import { readFile } from 'node:fs/promises'

const publicPackages = new Map([
  ['packages/create-tulip-slides', 'create-tulip-slides'],
  ['packages/slidev-addon-tulip-live', 'slidev-addon-tulip-live'],
  ['packages/slidev-theme-tulip-lab', 'slidev-theme-tulip-lab'],
  ['packages/tulip-slidev-check', 'tulip-slidev-check'],
])

const privateProjects = new Map([
  ['templates/course', '@tulip-lab/slidev-template-course'],
  ['templates/talk', '@tulip-lab/slidev-template-talk'],
  ['examples/course', '@tulip-lab/slidev-example-course'],
  ['examples/talk', '@tulip-lab/slidev-example-talk'],
  ['examples/layouts', '@tulip-lab/slidev-example-layouts'],
])

async function readManifest(path) {
  return JSON.parse(await readFile(new URL(`../${path}/package.json`, import.meta.url)))
}

function assert(condition, message) {
  if (!condition)
    throw new Error(message)
}

const root = await readManifest('.')
assert(root.private === true, 'The workspace root must remain private')

for (const [path, name] of publicPackages) {
  const manifest = await readManifest(path)
  assert(manifest.name === name, `${path} has an unexpected package name`)
  assert(manifest.version === '0.1.0', `${name} must use the shared stable release version`)
  assert(manifest.license === 'MIT', `${name} must use the MIT licence`)
  assert(manifest.private !== true, `${name} must remain eligible for future publication`)
}

for (const [path, name] of privateProjects) {
  const manifest = await readManifest(path)
  assert(manifest.name === name, `${path} has an unexpected package name`)
  assert(manifest.license === 'CC-BY-4.0', `${name} must use the CC BY 4.0 content licence`)
  assert(manifest.private === true, `${name} must not be publishable`)
}

console.log(`Validated ${1 + publicPackages.size + privateProjects.size} workspace projects`)
