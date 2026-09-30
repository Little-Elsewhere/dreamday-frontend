import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { LoginForm } from '@/features/auth/components/forms/login-form'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.login')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const Login = (): ReactElement => <LoginForm />

export default Login
