import 'server-only'

import { io } from 'next/cache'
import type { ReactNode } from 'react'

import { ROUTES } from '@/constants/routes'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

interface RequireSessionProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const RequireSession = async ({
  children,
  params,
}: RequireSessionProps): Promise<ReactNode> => {
  await io()

  const { locale } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
  }

  return children
}
