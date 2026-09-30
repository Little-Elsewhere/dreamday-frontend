import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { ROUTES } from '@/constants/routes'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'
import { AuthEmailOtpType } from '@/features/auth/constants/email-otp-type'
import { Link } from '@/i18n/navigation'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.error')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

const AuthErrorContent = async ({ searchParams }: Props): Promise<ReactElement> => {
  const t = await getTranslations('auth.error')
  const { type } = await searchParams
  let message = t('messages.generic')

  switch (type) {
    case AuthEmailOtpType.Signup:
      message = t('messages.signupFailed')
      break
    case AuthEmailOtpType.Recovery:
      message = t('messages.recoveryFailed')
      break
  }

  return (
    <section aria-labelledby="auth-title">
      <p className="text-champagne-ink mb-3 text-[13px] font-semibold tracking-[0.16em] uppercase">
        {t('content.eyebrow')}
      </p>
      <h1
        className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
        id="auth-title"
      >
        {t('content.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]" role="alert">
        {message}
      </p>

      <div className="mt-8 grid gap-3">
        <Link
          className="focus-visible:outline-focus rounded-auth border-primary bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {t('actions.login')}
        </Link>
        <Link
          className="focus-visible:outline-focus rounded-auth border-line-strong bg-surface text-primary hover:border-primary hover:bg-paper inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.REGISTER}
        >
          {t('actions.register')}
        </Link>
      </div>
    </section>
  )
}

const AuthErrorPage = ({ searchParams }: Props): ReactElement => (
  <Suspense fallback={<AuthLoading />}>
    <AuthErrorContent searchParams={searchParams} />
  </Suspense>
)

export default AuthErrorPage
