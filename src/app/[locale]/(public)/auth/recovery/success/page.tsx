import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { AuthEmailSuccess } from '@/features/auth/components/common/auth-email-success'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.recovery')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const RecoverySuccessPage = async (): Promise<ReactElement> => {
  const [commonT, recoveryT] = await Promise.all([
    getTranslations('auth.common'),
    getTranslations('auth.recovery'),
  ])

  return (
    <AuthEmailSuccess
      eyebrow={commonT('confirmation.eyebrow')}
      title={commonT('confirmation.title')}
      description={recoveryT('confirmation.description')}
      helper={commonT('confirmation.helper')}
      actionLabel={commonT('actions.login')}
    />
  )
}

export default RecoverySuccessPage
