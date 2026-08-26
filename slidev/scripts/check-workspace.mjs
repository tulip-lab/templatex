import { readFile } from 'node:fs/promises'
import {
  PACKAGE_VERSIONS,
  TULIP_LAB_SLIDEV_VERSION,
} from '../packages/create-tulip-lab-slides/src/create-project.mjs'

const publicPackages = new Map([
  ['packages/create-tulip-lab-slides', 'create-tulip-lab-slides'],
  ['packages/slidev-addon-tulip-lab-live', 'slidev-addon-tulip-lab-live'],
  ['packages/slidev-addon-tulip-lab-pages', 'slidev-addon-tulip-lab-pages'],
  ['packages/slidev-theme-tulip-lab', 'slidev-theme-tulip-lab'],
  ['packages/tulip-lab-slidev-check', 'tulip-lab-slidev-check'],
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
  assert(manifest.version === TULIP_LAB_SLIDEV_VERSION, `${name} must use coordinated release ${TULIP_LAB_SLIDEV_VERSION}`)
  assert(manifest.license === 'MIT', `${name} must use the MIT licence`)
  assert(manifest.private !== true, `${name} must remain eligible for future publication`)
  if (PACKAGE_VERSIONS[name])
    assert(PACKAGE_VERSIONS[name] === TULIP_LAB_SLIDEV_VERSION, `create-tulip-lab-slides must generate ${name}@${TULIP_LAB_SLIDEV_VERSION}`)
}

for (const [path, name] of privateProjects) {
  const manifest = await readManifest(path)
  assert(manifest.name === name, `${path} has an unexpected package name`)
  assert(manifest.license === 'CC-BY-4.0', `${name} must use the CC BY 4.0 content licence`)
  assert(manifest.private === true, `${name} must not be publishable`)
}

console.log(`Validated ${1 + publicPackages.size + privateProjects.size} workspace projects`)
