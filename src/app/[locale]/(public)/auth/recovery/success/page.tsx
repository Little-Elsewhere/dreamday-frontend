import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { AuthEmailSuccess } from '@/features/auth/components/common/auth-email-success'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.recovery')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const RecoverySuccessPage = async (): Promise<ReactElement> => {
  const t = await getTranslations('auth.recovery')

  return (
    <AuthEmailSuccess
      eyebrow={t('confirmation.eyebrow')}
      title={t('confirmation.title')}
      description={t('confirmation.description')}
      helper={t('confirmation.helper')}
      actionLabel={t('actions.login')}
    />
  )
}

export default RecoverySuccessPage
