import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { RegisterForm } from '@/features/auth/components/forms/register-form'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.register')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default function Register(): ReactElement {
  return <RegisterForm />
}
