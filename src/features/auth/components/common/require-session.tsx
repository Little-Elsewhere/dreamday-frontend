import 'server-only'

import type { ReactNode } from 'react'

import { ROUTES } from '@/constants/routes'
import { getCurrentUser } from '@/features/auth/actions/session'
import { redirect } from '@/i18n/navigation'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const RequireSession = async ({ children, params }: Props): Promise<ReactNode> => {
  const user = await getCurrentUser()

  if (!user) {
    const { locale } = await params
    redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
  }

  return children
}
