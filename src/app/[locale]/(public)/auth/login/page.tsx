import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { ROUTES } from '@/constants/routes'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { LoginForm } from '@/features/auth/components/forms/login-form'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.login')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const LoginContent = async (): Promise<ReactElement> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    const locale = await getLocale()
    redirect({ href: ROUTES.PRIVATE.ACCOUNT, locale })
  }

  return <LoginForm />
}

const Login = (): ReactElement => (
  <Suspense fallback={<AuthLoading />}>
    <LoginContent />
  </Suspense>
)

export default Login
