import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { ROUTES } from '@/constants/routes'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { LoginForm } from '@/features/auth/components/forms/login-form'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.login')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const LoginContent = async ({ searchParams }: Props): Promise<ReactElement> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    const locale = await getLocale()
    redirect({ href: ROUTES.PRIVATE.ACCOUNT, locale })
  }

  const { status } = await searchParams

  return <LoginForm status={status as string} />
}

const Login = ({ searchParams }: Props): ReactElement => {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}

export default Login
