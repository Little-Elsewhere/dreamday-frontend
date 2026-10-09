import { execFileSync } from 'node:child_process'

export type LocalSupabaseStatus = Record<string, unknown>

const DEFAULT_SUPABASE_URL = 'http://127.0.0.1:54321'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const assertLocalSupabaseUrl = (value: string): string => {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('E2E_SUPABASE_URL must be a local URL.')
  }

  const localHosts = new Set(['127.0.0.1', 'localhost', '::1', 'supabase.local'])
  if (!localHosts.has(url.hostname)) {
    throw new Error('Playwright account provisioning is restricted to local Supabase.')
  }

  return url.origin
}

export const readLocalSupabaseStatus = (): LocalSupabaseStatus => {
  let statusOutput: string

  try {
    statusOutput = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    throw new Error(
      'Could not read local Supabase keys. Start the local Supabase stack before running Playwright.',
    )
  }

  let status: unknown
  try {
    status = JSON.parse(statusOutput)
  } catch {
    throw new Error('Local Supabase status did not return valid JSON.')
  }

  if (!isRecord(status)) {
    throw new Error('Local Supabase status did not return a JSON object.')
  }

  return status
}

export const getLocalSupabasePublicConfig = (
  status: LocalSupabaseStatus = readLocalSupabaseStatus(),
): { publishableKey: string; url: string } => {
  const urlValue =
    process.env.E2E_SUPABASE_URL ??
    (typeof status.API_URL === 'string' ? status.API_URL : DEFAULT_SUPABASE_URL)
  const publishableKey =
    process.env.E2E_SUPABASE_PUBLISHABLE_KEY ?? status.PUBLISHABLE_KEY ?? status.ANON_KEY

  if (typeof publishableKey !== 'string' || publishableKey.length === 0) {
    throw new Error('Local Supabase status did not include a publishable key for Auth.')
  }

  return { url: assertLocalSupabaseUrl(urlValue), publishableKey }
}
