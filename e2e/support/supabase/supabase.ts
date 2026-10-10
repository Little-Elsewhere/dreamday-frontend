import { execFileSync } from 'node:child_process'

import { type LocalSupabaseStatus, localSupabaseStatusSchema } from '../schemas/supabase'

export const assertLocalSupabaseUrl = (value: string): string => {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Local Supabase status returned an invalid API URL.')
  }

  const localHosts = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', 'supabase.local'])
  if (!localHosts.has(url.hostname)) {
    throw new Error('Playwright account provisioning is restricted to local Supabase.')
  }

  return url.origin
}

export const readLocalSupabaseStatus = (): LocalSupabaseStatus => {
  let output: string

  try {
    output = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    throw new Error(
      'Could not read local Supabase keys. Start the local Supabase stack before running Playwright.',
    )
  }

  try {
    return localSupabaseStatusSchema.parse(JSON.parse(output))
  } catch {
    throw new Error('Local Supabase status did not return valid JSON with the expected keys.')
  }
}

export const getLocalSupabasePublicConfig = (
  status: LocalSupabaseStatus = readLocalSupabaseStatus(),
): { publishableKey: string; url: string } => {
  const urlValue = status.API_URL
  const publishableKey = status.PUBLISHABLE_KEY

  if (!urlValue) {
    throw new Error('Local Supabase status did not include an API URL.')
  }

  if (!publishableKey) {
    throw new Error('Local Supabase status did not include a publishable key for Auth.')
  }

  return { url: assertLocalSupabaseUrl(urlValue), publishableKey }
}
