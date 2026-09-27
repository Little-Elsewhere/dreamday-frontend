import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { Suspense, type ReactElement } from 'react'

import { ROUTES } from '@/constants/routes'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<{ title: string; description: string }> {
  const t = await getTranslations('account')
  return { title: t('metadata.title'), description: t('metadata.description') }
}

async function AccountContent(): Promise<ReactElement> {
  const locale = await getLocale()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect(`/${locale}${ROUTES.PUBLIC.AUTH.LOGIN}`)
  }

  const t = await getTranslations('account')
  const email = typeof data.claims.email === 'string' ? data.claims.email : null

  return (
    <main className="bg-surface text-ink min-h-svh antialiased">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 py-8 md:px-12 md:py-10">
        <header className="border-line flex items-center justify-between gap-6 border-b pb-6">
          <Link
            href={ROUTES.PUBLIC.ROOT}
            className="text-primary focus-visible:outline-focus text-xl font-semibold tracking-[-0.03em] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {t('labels.brand')}
          </Link>
          <span className="text-ink-soft text-sm">{t('labels.account')}</span>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-2 lg:gap-20">
          <div className="max-w-xl">
            <p className="text-champagne-ink mb-5 text-sm font-semibold tracking-[0.16em] uppercase">
              {t('content.eyebrow')}
            </p>
            <h1 className="text-primary text-4xl leading-tight font-medium tracking-tighter md:text-6xl">
              {t('content.title')}
            </h1>
            <p className="text-ink-soft mt-6 max-w-md text-lg leading-relaxed">
              {t('content.description')}
            </p>

            <div className="border-line mt-10 border-t pt-7">
              <p className="text-ink-soft text-sm">{t('labels.signedInAs')}</p>
              <p className="text-primary mt-1 font-medium break-all">
                {email ?? t('labels.verifiedAccount')}
              </p>
              <div className="mt-7">
                <SignOutButton />
              </div>
            </div>
          </div>

          <div className="rounded-auth relative hidden aspect-4/5 overflow-hidden lg:block">
            <Image
              src="/images/lan-ha-bay.jpg"
              alt={t('content.imageAlt')}
              fill
              sizes="(min-width: 1024px) 40vw, 0px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default async function AccountPage(): Promise<ReactElement> {
  const t = await getTranslations('account')

  return (
    <Suspense
      fallback={
        <main className="bg-surface text-ink grid min-h-svh place-items-center px-6">
          <p role="status" className="text-ink-soft text-sm">
            {t('messages.loading')}
          </p>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  )
}
