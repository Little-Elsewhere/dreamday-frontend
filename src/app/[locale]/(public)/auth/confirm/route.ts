import { NextResponse, type NextRequest } from 'next/server'

import { HTTP_STATUS } from '@/constants/httpStatuses'
import { ROUTES } from '@/constants/routes'
import { AuthCallbackType } from '@/features/auth/constants/auth-callback-type'
import { confirmationSchema } from '@/features/auth/schemas/callback'
import { createClient } from '@/lib/supabase/server'
import { serverEnv } from '@/env/server'
import { EmailOtpType } from '@supabase/supabase-js'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url)
  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type') as EmailOtpType,
    next: searchParams.get('next'),
  })

  if (parsed.success) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.verifyOtp(parsed.data)

      if (!error) {
        const destinationUrl = new URL(parsed.data.next, serverEnv.NEXT_PUBLIC_APP_URL)
        return NextResponse.redirect(destinationUrl, {
          status: HTTP_STATUS.FOUND,
        })
      }
    } catch (error) {
      console.error('[auth] email confirmation failed unexpectedly', error)
    }
  }

  const failureUrl = new URL(ROUTES.PUBLIC.AUTH.LOGIN, serverEnv.NEXT_PUBLIC_APP_URL)
  failureUrl.searchParams.set(
    'status',
    searchParams.get('type') === AuthCallbackType.Recovery
      ? 'recovery-failed'
      : 'confirmation-failed',
  )
  return NextResponse.redirect(failureUrl, { status: HTTP_STATUS.FOUND })
}
