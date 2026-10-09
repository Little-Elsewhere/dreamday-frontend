import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import { serverEnv } from '@/env/server'
import { AuthSessionState } from '@/features/auth/constants/auth'
import { isMissingSession } from '@/features/auth/utils/session-error'

interface UpdateSessionResult {
  response: NextResponse
  state: AuthSessionState
}

export const updateSession = async (request: NextRequest): Promise<UpdateSessionResult> => {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

  try {
    const { data, error } = await supabase.auth.getClaims()
    if (error && !isMissingSession(error)) {
      return { response: supabaseResponse, state: AuthSessionState.Error }
    }

    return {
      response: supabaseResponse,
      state: data?.claims ? AuthSessionState.Authenticated : AuthSessionState.Unauthenticated,
    }
  } catch {
    return { response: supabaseResponse, state: AuthSessionState.Error }
  }
}
