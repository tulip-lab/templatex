import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'

export const TULIP_LAB_SLIDEV_VERSION = '0.4.0'

export const PACKAGE_VERSIONS = Object.freeze({
  '@slidev/cli': '52.19.0',
  'slidev-addon-tulip-lab-live': TULIP_LAB_SLIDEV_VERSION,
  'slidev-addon-tulip-lab-pages': TULIP_LAB_SLIDEV_VERSION,
  'slidev-theme-tulip-lab': TULIP_LAB_SLIDEV_VERSION,
  'tulip-lab-slidev-check': TULIP_LAB_SLIDEV_VERSION,
  'vue': '3.5.41',
})

function packageName(target) {
  const normalized = basename(target)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'tulip-lab-slides'
}

async function targetState(target) {
  try {
    const details = await lstat(target)
    if (details.isSymbolicLink())
      throw new Error(`target directory must not be a symbolic link: ${target}`)
    if (!details.isDirectory())
      throw new Error(`target path is not a directory: ${target}`)
    if ((await readdir(target)).length > 0)
      throw new Error(`target directory is not empty: ${target}`)
    return 'empty'
  }
  catch (error) {
    if (error.code === 'ENOENT')
      return 'missing'
    throw error
  }
}

function manifest(profile, target) {
  const dependencies = {
    '@slidev/cli': PACKAGE_VERSIONS['@slidev/cli'],
    'slidev-addon-tulip-lab-pages': PACKAGE_VERSIONS['slidev-addon-tulip-lab-pages'],
    'slidev-theme-tulip-lab': PACKAGE_VERSIONS['slidev-theme-tulip-lab'],
    'tulip-lab-slidev-check': PACKAGE_VERSIONS['tulip-lab-slidev-check'],
    'vue': PACKAGE_VERSIONS.vue,
  }

  if (profile === 'course')
    dependencies['slidev-addon-tulip-lab-live'] = PACKAGE_VERSIONS['slidev-addon-tulip-lab-live']

  return {
    name: packageName(target),
    version: '0.0.0',
    private: true,
    description: `TULIP Lab Slidev ${profile} presentation.`,
    type: 'module',
    license: 'UNLICENSED',
    scripts: {
      build: 'slidev build',
      check: `tulip-lab-slidev-check --profile ${profile} .`,
      dev: 'slidev --open',
    },
    dependencies,
  }
}

export async function createProject(profile, targetDirectory) {
  if (!['course', 'talk'].includes(profile))
    throw new TypeError('profile must be "course" or "talk"')
  if (typeof targetDirectory !== 'string' || targetDirectory.trim() === '')
    throw new TypeError('target directory is required')

  const target = resolve(targetDirectory)
  const templateRoot = new URL(`../templates/${profile}/`, import.meta.url)
  const [slides, readme, contentLicence] = await Promise.all([
    readFile(new URL('slides.md', templateRoot), 'utf8'),
    readFile(new URL('README.md', templateRoot), 'utf8'),
    readFile(new URL('../LICENSE-CONTENT', import.meta.url), 'utf8'),
  ])

  await targetState(target)
  await mkdir(target, { recursive: true })
  await Promise.all([
    writeFile(join(target, 'slides.md'), slides),
    writeFile(join(target, 'README.md'), readme),
    writeFile(join(target, 'TEMPLATE-LICENSE.md'), contentLicence),
    writeFile(
      join(target, 'package.json'),
      `${JSON.stringify(manifest(profile, target), null, 2)}\n`,
    ),
  ])

  return { profile, target }
}
