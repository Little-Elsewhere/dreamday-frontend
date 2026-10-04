import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { ROUTES } from '@/constants/routes'
import { AuthSessionState } from '@/features/auth/constants/auth'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'
import { ActionErrorKind } from '@/types/action-result'
import { getLocaleFromPathname } from '@/utils/locale'

const intlMiddleware = createMiddleware(routing)

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const { response: supabaseResponse, state } = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const isPrivate = isPrivateRoute(pathname)
  const isLogin = isLoginRoute(pathname)
  const locale = getLocaleFromPathname(pathname)
  let response = intlMiddleware(request)

  if (state === AuthSessionState.Error && (isPrivate || isLogin)) {
    response = NextResponse.redirect(
      generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.ERROR, {
        queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
        fullUrl: true,
        includeLocale: true,
      }),
    )
  } else if (state === AuthSessionState.Unauthenticated && isPrivate) {
    response = NextResponse.redirect(
      generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.LOGIN, {
        fullUrl: true,
        includeLocale: true,
      }),
    )
  } else if (state === AuthSessionState.Authenticated && isLogin) {
    response = NextResponse.redirect(
      generateLocalizedUrl(locale, ROUTES.PRIVATE.ACCOUNT, {
        fullUrl: true,
        includeLocale: true,
      }),
    )
  }

  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = supabaseResponse.headers.get(header)
    if (value) response.headers.set(header, value)
  }

  if (isPrivate || isLogin) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|trpc(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\.(?:avif|css|eot|gif|ico|jpe?g|js|map|png|svg|ttf|webmanifest|webp|woff2?|xml|txt)$).*)',
  ],
}
