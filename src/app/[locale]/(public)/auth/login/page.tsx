import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { ROUTES } from '@/constants/routes'
import { AuthLoading } from '@/features/auth/components/auth-loading'
import { LoginForm } from '@/features/auth/login-form'
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

async function LoginContent({ searchParams }: Props): Promise<ReactElement> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    const locale = await getLocale()
    redirect(`/${locale}${ROUTES.PRIVATE.ACCOUNT}`)
  }

  const { status } = await searchParams
  const initialStatus =
    status === 'confirmation-failed' || status === 'recovery-failed' ? status : undefined

  return <LoginForm initialStatus={initialStatus} />
}

export default function Login({ searchParams }: Props): ReactElement {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}
