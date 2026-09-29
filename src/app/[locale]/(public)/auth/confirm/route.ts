import { NextResponse, type NextRequest } from 'next/server'

import { HTTP_STATUS } from '@/constants/httpStatuses'
import { ROUTES } from '@/constants/routes'
import { AuthCallbackType } from '@/features/auth/constants/auth-callback-type'
import { confirmationSchema } from '@/features/auth/schemas/callback'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { serverEnv } from '@/env/server'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = request.nextUrl
  const requestedLocale = request.nextUrl.pathname.split('/')[1]
  const locale =
    routing.locales.find((candidate) => candidate === requestedLocale) ?? routing.defaultLocale
  const origin = new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin
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
          parsed.data.type === AuthCallbackType.Recovery
            ? ROUTES.PUBLIC.AUTH.UPDATE_PASSWORD
            : ROUTES.PRIVATE.ACCOUNT
        const destinationUrl = new URL(getPathname({ locale, href: destination }), origin)
        return NextResponse.redirect(destinationUrl, {
          status: HTTP_STATUS.FOUND,
        })
      }
    } catch (error) {
      console.error('[auth] email confirmation failed unexpectedly', error)
    }
  }

  const failureUrl = new URL(getPathname({ locale, href: ROUTES.PUBLIC.AUTH.LOGIN }), origin)
  failureUrl.searchParams.set(
    'status',
    searchParams.get('type') === AuthCallbackType.Recovery
      ? 'recovery-failed'
      : 'confirmation-failed',
  )
  return NextResponse.redirect(failureUrl, { status: HTTP_STATUS.FOUND })
}
