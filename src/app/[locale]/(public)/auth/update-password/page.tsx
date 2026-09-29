import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { redirect } from '@/i18n/navigation'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { UpdatePasswordForm } from '@/features/auth/components/forms/update-password-form'
import { ROUTES } from '@/constants/routes'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.updatePassword')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const UpdatePasswordContent = async ({ params }: Props): Promise<ReactElement> => {
  const { locale } = await params

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale })
  }

  return <UpdatePasswordForm />
}

const UpdatePassword = ({ params }: Props): ReactElement => {
  return (
    <Suspense fallback={<AuthLoading />}>
      <UpdatePasswordContent params={params} />
    </Suspense>
  )
}

export default UpdatePassword
