import { serverEnv } from '@/env/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface UpdateSessionResult {
  response: NextResponse
  isAuthenticated: boolean
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

  const { data, error } = await supabase.auth.getClaims()

  return {
    response: supabaseResponse,
    isAuthenticated: !error && Boolean(data?.claims),
  }
}
