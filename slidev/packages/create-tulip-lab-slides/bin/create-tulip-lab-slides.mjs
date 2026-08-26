#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { createProject } from '../src/create-project.mjs'

const usage = `Usage: create-tulip-lab-slides <course|talk> <target-directory>

Create a TULIP Lab Slidev project in a new or empty directory.`

async function version() {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  return packageJson.version
}

try {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage)
  }
  else if (args.includes('--version') || args.includes('-v')) {
    console.log(await version())
  }
  else {
    if (args.length !== 2)
      throw new Error('profile and target directory are required')
    const result = await createProject(args[0], args[1])
    console.log(`Created TULIP Lab Slidev ${result.profile} project at ${result.target}.`)
  }
}
catch (error) {
  console.error(`Error: ${error.message}`)
  console.error(usage)
  process.exitCode = 1
}
