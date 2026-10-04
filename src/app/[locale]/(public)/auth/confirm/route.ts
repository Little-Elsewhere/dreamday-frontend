import { type NextRequest } from 'next/server'
import { ROUTES } from '@/constants/routes'
import { AuthErrorCode, AuthConfirmationFailure } from '@/features/auth/constants/auth'
import { confirmationSchema } from '@/features/auth/schemas/callback'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActionErrorKind } from '@/types/action-result'

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/[locale]/auth/confirm'>,
) => {
  const { locale } = await params
  const { searchParams } = new URL(request.url)

  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type'),
    next: searchParams.get('next') ?? undefined,
  })

  if (!parsed.success) {
    return redirect({ href: ROUTES.PUBLIC.AUTH.ERROR, locale })
  }

  const { token_hash, type, next } = parsed.data
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
    return redirect({
      href: generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.ERROR, {
        queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
      }),
      locale,
    })
  }

  return redirect({ href: next, locale })
}
