import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { parseDocument } from 'yaml'

const REQUIRED_LAYOUTS = ['toc', 'tulip-questions', 'tulip-contact']
const REQUIRED_METADATA = ['title', 'subtitle', 'course', 'author', 'affiliation']
const REQUIRED_DEPENDENCIES = ['@slidev/cli', 'slidev-theme-tulip-lab', 'vue']
const SKIPPED_DIRECTORIES = new Set(['.git', '.slidev', 'dist', 'node_modules', 'output'])

function displayPath(root, path) {
  return relative(root, path) || basename(path)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function parseFrontmatter(raw, file, root, errors) {
  const document = parseDocument(raw, { prettyErrors: true, strict: true })

  if (document.errors.length > 0) {
    for (const error of document.errors)
      errors.push(`${displayPath(root, file)}: invalid YAML frontmatter: ${error.message}`)
    return null
  }

  const value = document.toJS()
  if (!isRecord(value)) {
    errors.push(`${displayPath(root, file)}: frontmatter must be a YAML mapping`)
    return null
  }

  return value
}

function frontmatterBlocks(source) {
  const blocks = []
  const pattern = /(?:^|\r?\n)---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?=\r?\n|$)/g

  for (const match of source.matchAll(pattern))
    blocks.push({ raw: match[1], index: match.index ?? 0 })

  return blocks
}

function isLocalOrExactVersion(specifier) {
  return /^(?:workspace:|file:|link:)/.test(specifier)
    || /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(specifier)
}

async function markdownFiles(directory) {
  const files = []

  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  }
  catch (error) {
    if (error.code === 'ENOENT')
      return files
    throw error
  }

  for (const entry of entries) {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name))
      continue

    const path = join(directory, entry.name)
    if (entry.isDirectory())
      files.push(...await markdownFiles(path))
    else if (entry.isFile() && entry.name.endsWith('.md'))
      files.push(path)
  }

  return files
}

function checkImageAltText(source, file, root, errors) {
  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    const alt = match[0].match(/\balt\s*=\s*(["'])(.*?)\1/is)?.[2]
    if (!isNonEmptyString(alt))
      errors.push(`${displayPath(root, file)}: every HTML image needs non-empty alt text`)
  }

  const markdownPatterns = [
    /!\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g,
    /!\[([^\]]*)\]\[[^\]]*\]/g,
  ]

  for (const pattern of markdownPatterns) {
    for (const match of source.matchAll(pattern)) {
      if (!isNonEmptyString(match[1]))
        errors.push(`${displayPath(root, file)}: every Markdown image needs non-empty alt text`)
    }
  }
}

async function readJson(path, root, errors) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  }
  catch (error) {
    if (error.code === 'ENOENT')
      errors.push(`${displayPath(root, path)}: file does not exist`)
    else
      errors.push(`${displayPath(root, path)}: invalid JSON: ${error.message}`)
    return null
  }
}

async function collectDeckSources(file, root, errors, sources, { skipFirst = false } = {}) {
  const path = resolve(file)
  if (sources.has(path))
    return new Set()

  let source
  try {
    source = await readFile(path, 'utf8')
  }
  catch (error) {
    if (error.code === 'ENOENT') {
      errors.push(`${displayPath(root, path)}: referenced slide source does not exist`)
      return new Set()
    }
    throw error
  }

  sources.set(path, source)
  const layouts = new Set()
  const blocks = frontmatterBlocks(source).slice(skipFirst ? 1 : 0)

  for (const block of blocks) {
    if (!/^\s*(?:layout|navigation|section|block|session|sessionTitle|src)\s*:/m.test(block.raw))
      continue

    const frontmatter = parseFrontmatter(block.raw, path, root, errors)
    if (isNonEmptyString(frontmatter?.layout))
      layouts.add(frontmatter.layout)

    const imported = frontmatter?.src
    if (!isNonEmptyString(imported) || /^(?:[a-z]+:|\/)/i.test(imported))
      continue

    const importedLayouts = await collectDeckSources(resolve(dirname(path), imported), root, errors, sources)
    for (const layout of importedLayouts)
      layouts.add(layout)
  }

  return layouts
}

export async function checkDeck(directory, { profile } = {}) {
  if (!['course', 'talk'].includes(profile))
    throw new TypeError('profile must be "course" or "talk"')

  const root = resolve(directory)
  const slidesPath = join(root, 'slides.md')
  const packagePath = join(root, 'package.json')
  const errors = []
  const deckSources = new Map()

  let slidesSource
  try {
    slidesSource = await readFile(slidesPath, 'utf8')
  }
  catch (error) {
    if (error.code === 'ENOENT')
      errors.push('slides.md: file does not exist')
    else
      throw error
  }

  if (slidesSource !== undefined) {
    const blocks = frontmatterBlocks(slidesSource)
    if (blocks.length === 0 || blocks[0].index !== 0) {
      errors.push('slides.md: missing deck headmatter')
    }
    else {
      const headmatter = parseFrontmatter(blocks[0].raw, slidesPath, root, errors)
      if (headmatter) {
        if (headmatter.theme !== 'slidev-theme-tulip-lab')
          errors.push('slides.md: theme must be "slidev-theme-tulip-lab"')
        if (headmatter.layout !== 'cover')
          errors.push('slides.md: the first layout must be "cover"')
        if (headmatter.aspectRatio !== '16/10')
          errors.push('slides.md: aspectRatio must be "16/10"')
        if (headmatter.canvasWidth !== 1280)
          errors.push('slides.md: canvasWidth must be 1280')

        for (const field of REQUIRED_METADATA) {
          if (!isNonEmptyString(headmatter[field]))
            errors.push(`slides.md: required headmatter field "${field}" is missing`)
        }

        if (profile === 'course') {
          const addons = Array.isArray(headmatter.addons) ? headmatter.addons : []
          if (!addons.includes('slidev-addon-tulip-lab-live'))
            errors.push('slides.md: Course profile must include the "slidev-addon-tulip-lab-live" addon')
        }

        const addons = Array.isArray(headmatter.addons) ? headmatter.addons : []
        if (!addons.includes('slidev-addon-tulip-lab-pages')) {
          errors.push('slides.md: the "slidev-addon-tulip-lab-pages" addon is required')
        }
      }

      const layouts = await collectDeckSources(slidesPath, root, errors, deckSources, { skipFirst: true })

      for (const layout of REQUIRED_LAYOUTS) {
        if (!layouts.has(layout))
          errors.push(`slides.md: required layout "${layout}" is missing`)
      }
    }
  }

  const packageJson = await readJson(packagePath, root, errors)
  if (isRecord(packageJson)) {
    const dependencies = {
      ...(isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {}),
      ...(isRecord(packageJson.dependencies) ? packageJson.dependencies : {}),
    }
    const required = profile === 'course'
      ? [...REQUIRED_DEPENDENCIES, 'slidev-addon-tulip-lab-live', 'slidev-addon-tulip-lab-pages']
      : [...REQUIRED_DEPENDENCIES, 'slidev-addon-tulip-lab-pages']

    for (const name of required) {
      const specifier = dependencies[name]
      if (!isNonEmptyString(specifier)) {
        errors.push(`package.json: required dependency "${name}" is missing`)
        continue
      }
      if (!isLocalOrExactVersion(specifier))
        errors.push(`package.json: dependency "${name}" must use an exact version or a local workspace/file specifier`)
    }
  }

  const files = new Set([...await markdownFiles(root), ...deckSources.keys()])
  for (const file of files) {
    const source = deckSources.get(file) ?? await readFile(file, 'utf8')
    checkImageAltText(source, file, root, errors)
  }

  return { errors, profile, root }
}
