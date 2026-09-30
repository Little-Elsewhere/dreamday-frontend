import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { isPrivateRoute } from '@/features/auth/utils/private-route'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'

const intlMiddleware = createMiddleware(routing)

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const supabaseResponse = await updateSession(request)
  const response = intlMiddleware(request)

  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = supabaseResponse.headers.get(header)
    if (value) response.headers.set(header, value)
  }

  if (isPrivateRoute(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|trpc(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\.(?:avif|css|eot|gif|ico|jpe?g|js|map|png|svg|ttf|webmanifest|webp|woff2?|xml|txt)$).*)',
  ],
}
