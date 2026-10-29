import 'server-only'

import { getTranslations } from 'next-intl/server'

import { API_ROUTES } from '@/constants/api-routes'
import { ROUTES } from '@/constants/routes'
import { AUTH_MESSAGE_CODE } from '@/features/auth/constants/codes'
import { messageResponseSchema } from '@/features/auth/schemas/api'
import { Link } from '@/i18n/navigation'
import { post } from '@/utils/api-client'

type Props = {
  token?: string
}

export const ConfirmEmailResult = async ({ token }: Props) => {
  const t = await getTranslations('auth.confirm')

  let verified = false
  if (token) {
    const result = await post(API_ROUTES.AUTH.VERIFY_EMAIL, messageResponseSchema, {
      body: { token },
    })
    verified = result.ok && result.data.code === AUTH_MESSAGE_CODE.EMAIL_VERIFIED
  }

  if (verified) {
    return (
      <section aria-labelledby="auth-title">
        <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
          {t('content.eyebrow')}
        </p>
        <h1
          className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
          id="auth-title"
        >
          {t('content.successTitle')}
        </h1>
        <p className="text-ink-soft mt-4 max-w-[42ch]" role="status">
          {t('content.successDescription')}
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

  return (
    <section aria-labelledby="auth-title">
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('content.eyebrow')}
      </p>
      <h1
        className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
        id="auth-title"
      >
        {t('content.errorTitle')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]" role="alert">
        {t('content.errorDescription')}
      </p>
      <div className="mt-8 grid gap-3">
        <Link
          prefetch
          className="focus-visible:outline-focus rounded-auth border-primary bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {t('actions.login')}
        </Link>
        <Link
          prefetch
          className="focus-visible:outline-focus rounded-auth border-line-strong bg-surface text-primary hover:border-primary hover:bg-paper inline-flex min-h-11 items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.REGISTER}
        >
          {t('actions.register')}
        </Link>
      </div>
    </section>
  )
}
