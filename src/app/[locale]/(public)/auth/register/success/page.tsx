import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { ROUTES } from '@/constants/routes'
import { Link } from '@/i18n/navigation'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('auth.register')

  return {
    title: t('confirmation.title'),
    description: t('confirmation.description'),
  }
}

const RegisterSuccessPage = async (): Promise<ReactElement> => {
  const t = await getTranslations('auth.register')

  return (
    <section aria-labelledby="auth-title">
      <div
        className="border-champagne bg-champagne-soft text-primary mb-8 grid size-14 place-items-center rounded-full border"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={Mail01Icon} size={26} strokeWidth={1.6} />
      </div>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('confirmation.eyebrow')}
      </p>
      <h1
        className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
        id="auth-title"
      >
        {t('confirmation.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]" role="status">
        {t('confirmation.description')}
      </p>
      <p className="text-ink-soft mt-3 max-w-[42ch] text-sm">{t('confirmation.helper')}</p>

      <Link
        className="focus-visible:outline-focus rounded-auth border-primary bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex min-h-11 w-full items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        href={ROUTES.PUBLIC.AUTH.LOGIN}
      >
        {t('actions.login')}
      </Link>
    </section>
  )
}

export default RegisterSuccessPage
