import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { ROUTES } from '@/constants/routes'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { ResetPasswordForm } from '@/features/auth/components/forms/reset-password-form'
import { readSearchParam } from '@/features/auth/utils/search-params'
import { Link } from '@/i18n/navigation'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.resetPassword')
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const ResetPasswordMissingToken = async () => {
  const t = await getTranslations('auth.resetPassword')

  return (
    <section aria-labelledby="auth-title">
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('content.eyebrow')}
      </p>
      <h1
        className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
        id="auth-title"
      >
        {t('content.missingTokenTitle')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]" role="alert">
        {t('content.missingTokenDescription')}
      </p>
      <Link
        prefetch
        className="focus-visible:outline-focus rounded-auth border-primary bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex min-h-11 w-full items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        href={ROUTES.PUBLIC.AUTH.LOGIN}
      >
        {t('actions.login')}
      </Link>
    </section>
  )
}

const ResetPasswordContent = async ({ searchParams }: Props) => {
  const params = await searchParams
  const token = readSearchParam(params.token)
  if (!token) return <ResetPasswordMissingToken />
  return <ResetPasswordForm token={token} />
}

const ResetPasswordPage = ({ searchParams }: Props) => (
  <Suspense fallback={<AuthLoading variant="update-password" />}>
    <ResetPasswordContent searchParams={searchParams} />
  </Suspense>
)

export default ResetPasswordPage
