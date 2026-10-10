import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from 'playwright/test'

import { E2E_BASE_URL, SUPABASE_URL } from './e2e/support/constants/urls'
import { readLocalEnv } from './e2e/support/local-env'

const localEnv = readLocalEnv()
const supabasePublishableKey = localEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabasePublishableKey) {
  throw new Error('The generated .env.local file is missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
}

const isSupabaseSecret = (key: string): boolean =>
  /SUPABASE/i.test(key) && /SECRET|SERVICE_ROLE|ACCESS_TOKEN/i.test(key)

const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) =>
      !key.startsWith('E2E_') &&
      !isSupabaseSecret(key) &&
      key !== 'NEXT_PUBLIC_SUPABASE_URL' &&
      key !== 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ),
)
webServerEnv.NEXT_PUBLIC_APP_URL = E2E_BASE_URL
webServerEnv.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
webServerEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = supabasePublishableKey

// Chromium only receives operating-system settings, never the full test-runner environment.
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
    command:
      'pnpm dev && docker compose --progress plain -f docker/dev/compose.yaml logs --follow --tail 0 app',
    url: `${E2E_BASE_URL}/en/auth/login`,
    reuseExistingServer: !process.env.CI,
    env: {
      ...webServerEnv,
      SWC_NATIVE_BINDING_CACHE: path.join(os.tmpdir(), 'dreamday-swc-native'),
    },
    timeout: 30_000,
  },
})
