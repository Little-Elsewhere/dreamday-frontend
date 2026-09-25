import { NextResponse, type NextRequest } from 'next/server'

import { confirmationSchema } from '@/features/auth/schemas/callback'
import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { createClient } from '@/lib/supabase/server'
import { HTTP_STATUS } from '@/constants/httpStatuses'
import { routing } from '@/i18n/routing'

function localizedPath(locale: string, path: string): string {
  return `/${locale}${path === ROUTES.PUBLIC.ROOT ? '' : path}`
}

function localizedUrl(locale: string, path: string): URL {
  const origin = new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin
  return new URL(localizedPath(locale, path), origin)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const requestedLocale = request.nextUrl.pathname.split('/')[1]
  const locale =
    routing.locales.find((candidate) => candidate === requestedLocale) ?? routing.defaultLocale
  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type'),
  })

  if (parsed.success) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.verifyOtp(parsed.data)

      if (!error) {
        const destination =
          parsed.data.type === 'recovery' ? ROUTES.PUBLIC.AUTH.UPDATE_PASSWORD : ROUTES.PUBLIC.ROOT
        const response = NextResponse.redirect(localizedUrl(locale, destination), {
          status: HTTP_STATUS.FOUND,
        })
        response.headers.set('Cache-Control', 'no-store, max-age=0')
        response.headers.set('Referrer-Policy', 'no-referrer')
        return response
      }
    } catch (error) {
      console.error('[auth] email confirmation failed unexpectedly', error)
    }
  }

  const failureUrl = localizedUrl(locale, ROUTES.PUBLIC.AUTH.LOGIN)
  failureUrl.searchParams.set(
    'status',
    searchParams.get('type') === 'recovery' ? 'recovery-failed' : 'confirmation-failed',
  )
  const response = NextResponse.redirect(failureUrl, { status: HTTP_STATUS.FOUND })
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
