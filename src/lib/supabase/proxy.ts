import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
    },
  )

  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  const localeSegment = request.nextUrl.pathname.match(/^\/([^/]+)(?=\/|$)/)?.[1]
  const locale = routing.locales.find((candidate) => candidate === localeSegment)
  const pathname = locale
    ? request.nextUrl.pathname.slice(locale.length + 1) || '/'
    : request.nextUrl.pathname
  const isPublicAuthPath = /^\/auth(?:\/|$)/.test(pathname)

  if (!user && !isPublicAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale ? `/${locale}` : ''}${ROUTES.PUBLIC.AUTH.LOGIN}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
