import { type NextRequest } from 'next/server'
import { ROUTES } from '@/constants/routes'
import { confirmationSchema } from '@/features/auth/schemas/callback'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<'/[locale]/auth/confirm'>,
) => {
  const { locale } = await params
  const { searchParams } = new URL(request.url)

  const parsed = confirmationSchema.safeParse({
    token_hash: searchParams.get('token_hash'),
    type: searchParams.get('type'),
    next: searchParams.get('next'),
  })

  if (!parsed.success) {
    return redirect({ href: ROUTES.PUBLIC.AUTH.ERROR, locale })
  }

  const { token_hash, type, next } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (!error) {
    redirect({ href: next, locale })
  }

  return redirect({ href: `${ROUTES.PUBLIC.AUTH.ERROR}?type=${type}`, locale })
}
