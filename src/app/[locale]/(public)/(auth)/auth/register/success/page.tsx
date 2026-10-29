import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { AuthEmailSuccess } from '@/features/auth/components/common/auth-email-success'
import { readSearchParam } from '@/features/auth/utils/search-params'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

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

const RegisterSuccessPage = async ({ searchParams }: Props) => {
  const [commonT, registerT, params] = await Promise.all([
    getTranslations('auth.common'),
    getTranslations('auth.register'),
    searchParams,
  ])
  const email = readSearchParam(params.email)

  return (
    <AuthEmailSuccess
      eyebrow={commonT('confirmation.eyebrow')}
      title={commonT('confirmation.title')}
      description={registerT('confirmation.description')}
      helper={commonT('confirmation.helper')}
      actionLabel={commonT('actions.login')}
      email={email}
      showResend={Boolean(email)}
    />
  )
}

export default RegisterSuccessPage
