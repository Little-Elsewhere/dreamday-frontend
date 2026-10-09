import os from 'node:os'
import path from 'node:path'

import { defineConfig, devices } from 'playwright/test'

import { getLocalSupabasePublicConfig } from './e2e/support/supabase-status'

const baseURL = 'http://127.0.0.1:4001'
const localSupabase = getLocalSupabasePublicConfig()

const webServerEntries: [string, string][] = []
const browserEntries: [string, string][] = []
for (const [key, value] of Object.entries(process.env)) {
  const isSupabaseSecret = key.includes('SUPABASE') && /SECRET|SERVICE_ROLE|ACCESS_TOKEN/i.test(key)
  const isPrivateCredential = /SECRET|PASSWORD|TOKEN|API_KEY|SERVICE_ROLE/i.test(key)
  if (value !== undefined && !key.startsWith('E2E_') && !isSupabaseSecret) {
    webServerEntries.push([key, value])
  }
  if (value !== undefined && !key.startsWith('E2E_') && !isPrivateCredential && !isSupabaseSecret) {
    browserEntries.push([key, value])
  }
}
const webServerEnv = Object.fromEntries(webServerEntries)
const browserEnv = Object.fromEntries(browserEntries)
webServerEnv.NEXT_PUBLIC_APP_URL = 'http://dreamday.local'
webServerEnv.NEXT_PUBLIC_SUPABASE_URL = localSupabase.url
webServerEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = localSupabase.publishableKey

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  timeout: 60_000,
  expect: { timeout: 3_000 },
  reporter: 'list',
  use: {
    baseURL,
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
    command: 'pnpm exec next dev --turbopack --hostname 127.0.0.1 --port 4001',
    url: 'http://127.0.0.1:4001/en/auth/login',
    reuseExistingServer: !process.env.CI,
    env: {
      ...webServerEnv,
      SWC_NATIVE_BINDING_CACHE: path.join(os.tmpdir(), 'dreamday-swc-native'),
    },
    timeout: 30_000,
  },
})
