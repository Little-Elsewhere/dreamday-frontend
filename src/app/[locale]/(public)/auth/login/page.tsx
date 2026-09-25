import type { Metadata } from 'next'
import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { AuthLoading } from '@/features/auth/components/auth-loading'
import { LoginForm } from '@/features/auth/login-form'

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
