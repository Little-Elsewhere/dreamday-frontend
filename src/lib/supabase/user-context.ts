import 'server-only'

import { isMissingSession } from '@/features/auth/utils/session-error'
import { createClient } from '@/lib/supabase/server'

export const getSupabaseUserContext = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error && !isMissingSession(error)) throw new Error('Could not verify user session')

  const userId = error || typeof data?.claims?.sub !== 'string' ? null : data.claims.sub

  return { supabase, userId }
}
