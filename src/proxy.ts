import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_LOCALE } from '@/constants/locale'
import { HTTP_STATUS } from '@/constants/httpStatuses'
import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { AuthSessionState } from '@/features/auth/constants/auth'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'
import { ActionErrorKind } from '@/types/action-result'
import { getPathnameLocale } from '@/utils/locale'

const intlMiddleware = createMiddleware(routing)

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const pathname = request.nextUrl.pathname
  const isPrivate = isPrivateRoute(pathname)
  const isLogin = isLoginRoute(pathname)
  const locale = getPathnameLocale(pathname) ?? DEFAULT_LOCALE
  const maintenancePath = generateLocalizedUrl(ROUTES.PUBLIC.MAINTENANCE, { locale })

  if (serverEnv.MAINTENANCE_MODE === 'true') {
    if (pathname !== maintenancePath) {
      const url = request.nextUrl.clone()
      url.pathname = maintenancePath

      return NextResponse.rewrite(url, {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: {
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      })
    }

    const response = intlMiddleware(request)
    response.headers.set('Cache-Control', 'no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')

    return response
  }

  const { response: supabaseResponse, state } = await updateSession(request)
  let response = intlMiddleware(request)

  if (state === AuthSessionState.Error && (isPrivate || isLogin)) {
    response = NextResponse.redirect(
      generateLocalizedUrl(ROUTES.PUBLIC.AUTH.ERROR, {
        locale,
        queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
        fullUrl: true,
      }),
    )
  } else if (state === AuthSessionState.Unauthenticated && isPrivate) {
    response = NextResponse.redirect(
      generateLocalizedUrl(ROUTES.PUBLIC.AUTH.LOGIN, {
        locale,
        fullUrl: true,
      }),
    )
  } else if (state === AuthSessionState.Authenticated && isLogin) {
    response = NextResponse.redirect(
      generateLocalizedUrl(ROUTES.PRIVATE.ACCOUNT, {
        locale,
        fullUrl: true,
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
