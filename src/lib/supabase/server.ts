import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { serverEnv } from '@/env/server'
import { isMissingSession } from '@/features/auth/utils/session-error'
import type { Database } from '@/types/database'
import type { ServerSupabaseClient } from '@/types/supabase'

export const createClient = async (): Promise<ServerSupabaseClient> => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components cannot write cookies; src/proxy.ts refreshes them before render.
          }
        },
      },
    },
  )
}

export const getSupabaseContext = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error && !isMissingSession(error)) throw new Error('Could not verify user session')

  const userId = error || typeof data?.claims?.sub !== 'string' ? null : data.claims.sub

  return { supabase, userId }
}
