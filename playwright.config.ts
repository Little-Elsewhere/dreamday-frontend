import { defineConfig, devices } from 'playwright/test'

import { E2E_BASE_URL } from './e2e/helpers/env'

const browserEnv = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  TMPDIR: process.env.TMPDIR,
  TEMP: process.env.TEMP,
  TMP: process.env.TMP,
  SystemRoot: process.env.SystemRoot,
  LANG: process.env.LANG,
  LC_ALL: process.env.LC_ALL,
  DISPLAY: process.env.DISPLAY,
  WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY,
  XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR,
  LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH,
  DYLD_LIBRARY_PATH: process.env.DYLD_LIBRARY_PATH,
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: 'list',
  use: {
    baseURL: E2E_BASE_URL,
    browserName: 'chromium',
    headless: true,
    launchOptions: { env: browserEnv },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: `${E2E_BASE_URL}/en/auth/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: E2E_BASE_URL,
      API_BASE_URL:
        process.env.E2E_API_BASE_URL ?? process.env.API_BASE_URL ?? 'http://localhost:8000',
      MAINTENANCE_MODE: process.env.MAINTENANCE_MODE ?? 'false',
    },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium' },
      testMatch: ['**/auth/login-validation.spec.ts', '**/public/**/*.spec.ts'],
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      testMatch: ['**/auth/login-validation.spec.ts', '**/public/**/*.spec.ts'],
    },
  ],
})
