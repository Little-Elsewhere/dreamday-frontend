import 'server-only'

import { io } from 'next/cache'
import type { ReactNode } from 'react'

import { ROUTES } from '@/constants/routes'
import { AuthSessionState } from '@/features/auth/constants/auth'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { redirect } from '@/i18n/navigation'
import { isMissingSession } from '@/features/auth/utils/session-error'
import { createClient } from '@/lib/supabase/server'
import { ActionErrorKind } from '@/types/action-result'

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
    redirect({
      href: generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.ERROR, {
        queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
      }),
      locale,
    })
  }

  if (state === AuthSessionState.Unauthenticated) {
    redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
  }

  return children
}
