import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { ROUTES } from '@/constants/routes'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'
import { getLocaleFromPathname } from '@/utils/locale'

const intlMiddleware = createMiddleware(routing)

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const { response: supabaseResponse, isAuthenticated } = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const isPrivate = isPrivateRoute(pathname)
  const isLogin = isLoginRoute(pathname)
  const locale = getLocaleFromPathname(pathname)
  let response = intlMiddleware(request)

  if (!isAuthenticated && isPrivate) {
    const loginPathname = `/${locale}${ROUTES.PUBLIC.AUTH.LOGIN}`
    response = NextResponse.redirect(new URL(loginPathname, request.url))
  } else if (isAuthenticated && isLogin) {
    const accountPathname = `/${locale}${ROUTES.PRIVATE.ACCOUNT}`
    response = NextResponse.redirect(new URL(accountPathname, request.url))
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
