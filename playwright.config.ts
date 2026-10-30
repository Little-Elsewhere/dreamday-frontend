import { defineConfig, devices } from 'playwright/test'

const E2E_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

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
  workers: 4,
  timeout: 30_000,
  expect: { timeout: 3_000 },
  reporter: 'list',
  use: {
    baseURL: E2E_BASE_URL,
    browserName: 'chromium',
    headless: true,
    launchOptions: { env: browserEnv },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
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
})
