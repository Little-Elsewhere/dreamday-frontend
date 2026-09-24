import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/navigation'
import { UpdatePasswordForm } from '@/features/auth/update-password-form'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.updatePassword')
  return { title: t('content.title') }
}

export default async function UpdatePassword({ params }: Props): Promise<ReactElement> {
  const { locale } = await params

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })

  return <UpdatePasswordForm />
}
