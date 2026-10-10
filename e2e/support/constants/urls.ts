import { readLocalEnv } from '../local-env'

const localEnv = readLocalEnv()

export const E2E_BASE_URL = localEnv.NEXT_PUBLIC_APP_URL || 'http://dreamday.local'
export const MAILPIT_URL = localEnv.MAILPIT_URL || 'http://mailpit.local'
export const SUPABASE_URL = localEnv.NEXT_PUBLIC_SUPABASE_URL || 'http://supabase.local'
