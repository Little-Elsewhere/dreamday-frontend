import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from 'playwright/test'

const baseURL = process.env.TRIPS_E2E_BASE_URL ?? 'http://localhost:4000'

export default defineConfig({
  testDir: './e2e/trips',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: process.env.TRIPS_E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec next dev --turbopack --hostname 127.0.0.1 --port 4000',
        url: 'http://127.0.0.1:4000/en/auth/login',
        reuseExistingServer: !process.env.CI,
        env: { SWC_NATIVE_BINDING_CACHE: path.join(os.tmpdir(), 'dreamday-swc-native') },
        timeout: 120_000,
      },
})
