import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from 'playwright/test'

const baseURL = 'http://127.0.0.1:4001'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  timeout: 30_000,
  expect: { timeout: 3_000 },
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
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium' },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm exec next dev --turbopack --hostname 127.0.0.1 --port 4001',
    url: 'http://127.0.0.1:4001/en/auth/login',
    reuseExistingServer: !process.env.CI,
    env: { SWC_NATIVE_BINDING_CACHE: path.join(os.tmpdir(), 'dreamday-swc-native') },
    timeout: 30_000,
  },
})
