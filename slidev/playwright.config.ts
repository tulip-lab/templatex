import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './output/playwright',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    colorScheme: 'light',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'pnpm --dir examples/layouts exec slidev slides.md --port 4173 --remote 127.0.0.1 --log error',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
