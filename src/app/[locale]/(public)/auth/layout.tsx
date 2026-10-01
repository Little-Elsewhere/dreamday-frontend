import Image from 'next/image'
import type { ReactElement, ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import { Footer } from '@/components/common/footer'

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
          loading="eager"
        />
        <div className="bg-shade/25 absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mt-auto w-full p-10 text-white lg:p-[clamp(40px,6vw,88px)]">
          <div className="bg-champagne-soft mb-6 h-px w-14" aria-hidden="true" />
          <p className="m-0 max-w-[15ch] text-[clamp(2rem,3.2vw,3.5rem)] leading-[1.18] font-normal tracking-[-0.045em]">
            {t('common.content.visualQuote')}
          </p>
          <p className="mt-6 text-sm text-white/80">{t('common.content.visualMeta')}</p>
        </div>
      </section>

      <section
        className="auth-wide:pl-[clamp(72px,8vw,136px)] auth-wide:pr-[clamp(72px,8vw,136px)] flex min-w-0 flex-col pt-[max(24px,env(safe-area-inset-top))] pr-[max(20px,env(safe-area-inset-right))] pb-[max(24px,env(safe-area-inset-bottom))] pl-[max(20px,env(safe-area-inset-left))] md:pt-8 md:pr-[clamp(32px,7vw,80px)] md:pb-8 md:pl-[clamp(32px,7vw,80px)] lg:min-h-svh"
        aria-labelledby="auth-title"
      >
        <div className="flex w-full flex-1 items-center self-center py-12 md:py-16">
          <div className="animate-auth-enter w-full motion-reduce:animate-none">{children}</div>
        </div>

        <Footer />
      </section>
    </main>
  )
}

export default AuthLayout
