import Image from 'next/image'
import type { ReactElement, ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { ROUTES } from '@/constants/routes'

type Props = {
  children: ReactNode
}

const AuthLayout = async ({ children }: Props): Promise<ReactElement> => {
  const t = await getTranslations('auth')

  return (
    <main className="bg-surface text-ink auth-wide:grid-cols-[minmax(560px,52%)_minmax(600px,48%)] grid min-h-screen grid-cols-1 antialiased lg:grid-cols-[minmax(390px,46%)_minmax(520px,54%)]">
      <section
        className="bg-primary relative hidden overflow-hidden lg:flex lg:min-h-svh"
        aria-label={t('common.labels.visualSection')}
      >
        <Image
          className="absolute inset-0 size-full object-cover object-[52%_center] brightness-[.68] contrast-[1.04] saturate-[.72]"
          src="/images/lan-ha-bay.jpg"
          alt={t('common.descriptions.visualImageAlt')}
          fill
          sizes="(min-width: 1440px) 52vw, (min-width: 1024px) 46vw, 0px"
          priority
        />
        <div className="bg-shade/25 absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mt-auto w-full p-10 text-white lg:p-[clamp(40px,6vw,88px)]">
          <div className="bg-champagne-soft mb-6 h-px w-14" aria-hidden="true" />
          <p className="m-0 max-w-[15ch] text-[clamp(2rem,3.2vw,3.5rem)] leading-[1.18] font-normal tracking-[-0.045em]">
            {t('common.content.visualQuote')}
          </p>
          <p className="mt-6 text-[13px] text-white/80">{t('common.content.visualMeta')}</p>
        </div>
      </section>

      <section
        className="auth-wide:pl-[clamp(72px,8vw,136px)] auth-wide:pr-[clamp(72px,8vw,136px)] flex min-w-0 flex-col pt-[max(24px,env(safe-area-inset-top))] pr-[max(20px,env(safe-area-inset-right))] pb-[max(24px,env(safe-area-inset-bottom))] pl-[max(20px,env(safe-area-inset-left))] md:pt-8 md:pr-[clamp(32px,7vw,80px)] md:pb-8 md:pl-[clamp(32px,7vw,80px)] lg:min-h-svh"
        aria-labelledby="auth-title"
      >
        <Link
          className="text-primary focus-visible:outline-focus inline-flex shrink-0 items-center gap-3 self-start leading-none font-semibold tracking-[-0.03em] no-underline focus-visible:outline-2 focus-visible:outline-offset-3"
          href={ROUTES.PUBLIC.ROOT}
          aria-label={t('common.labels.brandHome')}
        >
          <span
            className="border-champagne text-champagne grid size-8 place-items-center rounded-full border"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 16.5c3.5-1 5.7-3.4 6.6-7.2 2.1 2.8 4.5 4.4 7.4 4.7" />
              <path d="M6 19h12" />
            </svg>
          </span>
          <span className="text-xl">dream day</span>
        </Link>

        <div className="flex w-full max-w-110 flex-1 items-center self-center py-12 md:py-16">
          <div className="animate-auth-enter w-full motion-reduce:animate-none">{children}</div>
        </div>

        <footer className="text-ink-soft text-[13px]">{t('common.content.footer')}</footer>
      </section>
    </main>
  )
}

export default AuthLayout
