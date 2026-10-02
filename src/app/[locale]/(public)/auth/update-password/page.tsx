import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { RequireSession } from '@/features/auth/components/common/require-session'
import { UpdatePasswordForm } from '@/features/auth/components/forms/update-password-form'

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

const UpdatePasswordPage = ({ params }: Props): ReactElement => (
  <Suspense fallback={<AuthLoading variant="update-password" />}>
    <RequireSession params={params}>
      <UpdatePasswordForm />
    </RequireSession>
  </Suspense>
)

export default UpdatePasswordPage
