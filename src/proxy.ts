import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { HTTP_STATUS } from '@/constants/httpStatuses'
import { DEFAULT_LOCALE, type Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import {
  readProxyAuthCookies,
  refreshTokensWithBaseUrl,
} from '@/features/auth/actions/refresh-on-proxy'
import {
  applySessionTokensToResponse,
  clearSessionTokensOnResponse,
} from '@/features/auth/actions/session-cookies'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'
import { routing } from '@/i18n/routing'
import { getPathnameLocale } from '@/utils/locale'

const intlMiddleware = createMiddleware(routing)

const redirectToLogin = (request: NextRequest, locale: Locale) => {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = generateLocalizedUrl(ROUTES.PUBLIC.AUTH.LOGIN, { locale })
  return NextResponse.redirect(loginUrl)
}

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

  if (isPrivate) {
    const { accessToken, refreshToken } = readProxyAuthCookies(request.cookies)

    if (!accessToken && !refreshToken) {
      return redirectToLogin(request, locale)
    }

    if (!accessToken && refreshToken) {
      const tokens = await refreshTokensWithBaseUrl(serverEnv.API_BASE_URL, refreshToken)

      if (!tokens) {
        const response = redirectToLogin(request, locale)
        clearSessionTokensOnResponse(response)
        return response
      }

      const response = NextResponse.redirect(request.nextUrl)
      applySessionTokensToResponse(response, tokens)
      response.headers.set('Cache-Control', 'private, no-store')
      return response
    }
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
