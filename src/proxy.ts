import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { HTTP_STATUS } from '@/constants/httpStatuses'
import { DEFAULT_LOCALE } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'
import { routing } from '@/i18n/routing'
import { getPathnameLocale } from '@/utils/locale'

const intlMiddleware = createMiddleware(routing)

export const proxy = (request: NextRequest): NextResponse => {
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

  const response = intlMiddleware(request)
  if (isPrivate || isLogin) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|trpc(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\.(?:avif|css|eot|gif|ico|jpe?g|js|map|png|svg|ttf|webmanifest|webp|woff2?|xml|txt)$).*)',
  ],
}
