import { NextResponse, type NextRequest } from 'next/server'

import { nextSchema, confirmationSchema } from '@/features/auth/schemas/callback'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/server'
import { EmailOtpType } from '@supabase/supabase-js'
import { HTTP_STATUS } from '@/constants/httpStatuses'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type') as EmailOtpType,
  })

  if (parsed.success) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp(parsed.data)

    if (!error) {
      const requestedNext = searchParams.get('next') ?? ROUTES.PUBLIC.ROOT
      const next = nextSchema.safeParse(requestedNext)
      return NextResponse.redirect(
        new URL(next.success ? next.data : ROUTES.PUBLIC.ROOT, request.url),
      )
    }
  }

  return NextResponse.redirect(new URL(ROUTES.PUBLIC.AUTH.LOGIN, request.url), {
    status: HTTP_STATUS.FOUND,
  })
}
