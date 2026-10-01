import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { AuthEmailSuccess } from '@/features/auth/components/common/auth-email-success'

export const generateMetadata = async (): Promise<Metadata> => {
  const [commonT, registerT] = await Promise.all([
    getTranslations('auth.common'),
    getTranslations('auth.register'),
  ])

  return {
    title: commonT('confirmation.title'),
    description: registerT('confirmation.description'),
  }
}

const RegisterSuccessPage = async (): Promise<ReactElement> => {
  const [commonT, registerT] = await Promise.all([
    getTranslations('auth.common'),
    getTranslations('auth.register'),
  ])

  return (
    <AuthEmailSuccess
      eyebrow={commonT('confirmation.eyebrow')}
      title={commonT('confirmation.title')}
      description={registerT('confirmation.description')}
      helper={commonT('confirmation.helper')}
      actionLabel={commonT('actions.login')}
    />
  )
}

export default RegisterSuccessPage
