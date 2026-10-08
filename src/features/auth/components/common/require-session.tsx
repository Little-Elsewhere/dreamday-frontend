import 'server-only'

import { io } from 'next/cache'
import type { ReactNode } from 'react'

import { ROUTES } from '@/constants/routes'
import { AuthSessionState } from '@/features/auth/constants/auth'
import { getAuthSystemErrorUrl } from '@/features/auth/utils/common'
import { redirect } from '@/i18n/navigation'
import { isMissingSession } from '@/features/auth/utils/session-error'
import { createClient } from '@/lib/supabase/server'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const RequireSession = async ({ children, params }: Props): Promise<ReactNode> => {
  await io()

  const { locale } = await params
  let state = AuthSessionState.Unauthenticated

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    if (error && !isMissingSession(error)) {
      state = AuthSessionState.Error
    } else if (data?.claims) {
      state = AuthSessionState.Authenticated
    }
  } catch {
    state = AuthSessionState.Error
  }

  if (state === AuthSessionState.Error) {
    redirect({ href: getAuthSystemErrorUrl(locale), locale })
  }

  if (state === AuthSessionState.Unauthenticated) {
    redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
  }

  return children
}
