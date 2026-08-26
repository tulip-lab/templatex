import { readFile } from 'node:fs/promises'
import { PACKAGE_VERSIONS } from '../packages/create-tulip-slides/src/create-project.mjs'

const publicPackages = new Map([
  ['packages/create-tulip-slides', { name: 'create-tulip-slides', version: '0.2.1' }],
  ['packages/slidev-addon-tulip-lab-live', { name: 'slidev-addon-tulip-lab-live', version: '0.2.0' }],
  ['packages/slidev-addon-tulip-lab-pages', { name: 'slidev-addon-tulip-lab-pages', version: '0.3.1' }],
  ['packages/slidev-theme-tulip-lab', { name: 'slidev-theme-tulip-lab', version: '0.3.1' }],
  ['packages/tulip-slidev-check', { name: 'tulip-slidev-check', version: '0.3.0' }],
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

for (const [path, { name, version }] of publicPackages) {
  const manifest = await readManifest(path)
  assert(manifest.name === name, `${path} has an unexpected package name`)
  assert(manifest.version === version, `${name} must use its declared stable release version`)
  assert(manifest.license === 'MIT', `${name} must use the MIT licence`)
  assert(manifest.private !== true, `${name} must remain eligible for future publication`)
  if (PACKAGE_VERSIONS[name])
    assert(PACKAGE_VERSIONS[name] === version, `create-tulip-slides must generate ${name}@${version}`)
}

for (const [path, name] of privateProjects) {
  const manifest = await readManifest(path)
  assert(manifest.name === name, `${path} has an unexpected package name`)
  assert(manifest.license === 'CC-BY-4.0', `${name} must use the CC BY 4.0 content licence`)
  assert(manifest.private === true, `${name} must not be publishable`)
}

console.log(`Validated ${1 + publicPackages.size + privateProjects.size} workspace projects`)
