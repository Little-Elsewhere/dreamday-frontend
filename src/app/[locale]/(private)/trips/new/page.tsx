import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'

import { CreateTripForm } from '@/features/trips/components/forms/create-trip-form'
import { Link } from '@/i18n/navigation'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips')
  return { title: t('trip.metadata.title') }
}

const NewTripPage = async (): Promise<ReactElement> => {
  const t = await getTranslations('trips')
  return (
    <main className="bg-paper text-ink min-h-svh">
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/trips" className="text-primary text-xl font-semibold tracking-tighter">
            {t('common.labels.brand')}
          </Link>
          <Link
            href="/trips"
            className="text-ink-soft hover:text-primary inline-flex items-center gap-2 text-sm"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} aria-hidden="true" />
            {t('common.actions.back')}
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-20">
        <p className="text-champagne-ink text-xs font-semibold tracking-[0.2em]">
          {t('trip.content.eyebrow')}
        </p>
        <h1 className="text-primary mt-4 text-4xl font-medium tracking-tight md:text-6xl">
          {t('trip.content.title')}
        </h1>
        <p className="text-ink-soft mt-4 mb-10 max-w-xl">{t('trip.content.description')}</p>
        <CreateTripForm />
      </div>
    </main>
  )
}

export default NewTripPage
