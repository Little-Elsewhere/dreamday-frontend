import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/proxy'

const intlMiddleware = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request)
  const response = intlMiddleware(request)

  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = supabaseResponse.headers.get(header)
    if (value) response.headers.set(header, value)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|trpc(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\.(?:avif|css|eot|gif|ico|jpe?g|js|map|png|svg|ttf|webmanifest|webp|woff2?|xml|txt)$).*)',
  ],
}
