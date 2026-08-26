#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { checkDeck } from '../src/check-deck.mjs'

const usage = `Usage: tulip-lab-slidev-check --profile <course|talk> [directory]

Validate a TULIP Lab Slidev deck. The directory defaults to the current directory.`

async function version() {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  return packageJson.version
}

function parseArguments(args) {
  let profile
  let directory = '.'
  let hasDirectory = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help' || argument === '-h')
      return { help: true }
    if (argument === '--version' || argument === '-v')
      return { version: true }
    if (argument === '--profile') {
      profile = args[index + 1]
      index += 1
      continue
    }
    if (argument.startsWith('--profile=')) {
      profile = argument.slice('--profile='.length)
      continue
    }
    if (argument.startsWith('-'))
      throw new Error(`unknown option: ${argument}`)
    if (hasDirectory)
      throw new Error(`unexpected argument: ${argument}`)
    directory = argument
    hasDirectory = true
  }

  if (!profile)
    throw new Error('--profile is required')

  return { directory, profile }
}

try {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    console.log(usage)
  }
  else if (options.version) {
    console.log(await version())
  }
  else {
    const result = await checkDeck(options.directory, { profile: options.profile })
    if (result.errors.length > 0) {
      console.error(`TULIP Lab Slidev check failed with ${result.errors.length} issue(s):`)
      for (const error of result.errors)
        console.error(`- ${error}`)
      process.exitCode = 1
    }
    else {
      console.log(`TULIP Lab Slidev ${result.profile} check passed for ${result.root}.`)
    }
  }
}
catch (error) {
  console.error(`Error: ${error.message}`)
  console.error(usage)
  process.exitCode = 1
}
