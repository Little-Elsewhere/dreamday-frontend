import { Add01Icon, Compass01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Link } from '@/i18n/navigation'

import { TripList } from './trip-list'

export async function TripPage(): Promise<ReactElement> {
  const t = await getTranslations('trips.tripList')
  return (
    <div className="bg-page text-ink min-h-screen">
      <header className="border-divider bg-surface/95 sticky top-0 z-10 border-b backdrop-blur-lg">
        <div className="w-page max-w-page mx-auto flex min-h-18 items-center justify-between gap-4 px-1">
          <Link
            className="text-forest inline-flex items-center gap-3 font-semibold tracking-tight no-underline"
            href="/"
          >
            <span
              className="border-gold text-gold grid size-8 place-items-center rounded-full border"
              aria-hidden="true"
            >
              <HugeiconsIcon icon={Compass01Icon} size={18} strokeWidth={1.8} />
            </span>
            <span>{t('brand')}</span>
          </Link>
          <Link
            className="bg-forest hover:bg-forest-hover inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white no-underline"
            href="#"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2} aria-hidden="true" />
            {t('actions.createTrip')}
          </Link>
        </div>
      </header>

      <main className="w-page max-w-page max-mobile:w-page-compact max-mobile:pt-6 mx-auto px-1 pt-10 pb-20">
        <p className="tracking-eyebrow text-gold-ink mb-3 text-xs font-semibold uppercase">
          {t('content.eyebrow')}
        </p>
        <h1 className="text-display tracking-display text-forest m-0 leading-tight font-medium">
          {t('content.title')}
        </h1>
        <p className="max-w-intro text-foreground-muted mt-3">{t('content.intro')}</p>
        <TripList />
      </main>
    </div>
  )
}
