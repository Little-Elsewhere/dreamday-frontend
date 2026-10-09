import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { RegisterForm } from '@/features/auth/components/forms/register-form'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.register')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const Register = (): ReactElement => {
  return <RegisterForm />
}

export default Register
