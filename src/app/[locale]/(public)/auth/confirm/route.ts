import { type NextRequest } from 'next/server'

import { DEFAULT_LOCALE } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { AuthConfirmationFailure, AuthErrorCode } from '@/features/auth/constants/auth'
import { confirmationSchema } from '@/features/auth/schemas/callback'
import { getConfirmationRedirect } from '@/features/auth/utils/callback'
import { getAuthSystemErrorUrl } from '@/features/auth/utils/common'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPathnameLocale } from '@/utils/locale'

export const GET = async (request: NextRequest) => {
  const locale = getPathnameLocale(request.nextUrl.pathname) ?? DEFAULT_LOCALE
  const { searchParams } = new URL(request.url)

  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type'),
    next: searchParams.get('next') ?? undefined,
  })

  if (!parsed.success) {
    return redirect({ href: ROUTES.PUBLIC.AUTH.ERROR, locale })
  }

  const { token_hash, type } = parsed.data
  const confirmationRedirect = getConfirmationRedirect(
    serverEnv.NEXT_PUBLIC_APP_URL,
    locale,
    parsed.data.next,
  )
  let failure: AuthConfirmationFailure | null = null

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (error) {
      if (
        error.code === AuthErrorCode.OtpExpired ||
        error.code === AuthErrorCode.ValidationFailed
      ) {
        failure = AuthConfirmationFailure.Link
      } else {
        failure = AuthConfirmationFailure.System
      }
    }
  } catch {
    failure = AuthConfirmationFailure.System
  }

  if (failure === AuthConfirmationFailure.Link) {
    return redirect({ href: `${ROUTES.PUBLIC.AUTH.ERROR}?type=${type}`, locale })
  }

  if (failure === AuthConfirmationFailure.System) {
    return redirect({ href: getAuthSystemErrorUrl(), locale })
  }

  return redirect(confirmationRedirect)
}
