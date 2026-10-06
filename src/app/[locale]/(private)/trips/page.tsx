import { io } from 'next/cache'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'

import { SignOutButton } from '@/features/auth/components/common/sign-out-button'
import { TripGrid } from '@/features/trips/components/common/trip-grid'
import { listTrips } from '@/features/trips/data/queries'
import { tripStatus } from '@/features/trips/utils/trip-status'
import { Link } from '@/i18n/navigation'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips')
  return { title: t('list.metadata.title') }
}

const TripsPage = async (): Promise<ReactElement> => {
  await io()
  const [trips, t] = await Promise.all([listTrips(), getTranslations('trips')])
  return (
    <main className="bg-paper text-ink min-h-svh">
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Link href="/trips" className="text-primary text-xl font-semibold tracking-tighter">
            {t('common.labels.brand')}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/trips/new"
              className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              {t('trip.actions.create')}
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-20">
        <p className="text-champagne-ink text-xs font-semibold tracking-[0.2em]">
          {t('list.content.eyebrow')}
        </p>
        <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-primary max-w-2xl text-4xl font-medium tracking-tight md:text-6xl">
              {t('list.content.title')}
            </h1>
            <p className="text-ink-soft mt-5 max-w-xl">{t('list.content.description')}</p>
          </div>
          <Link
            href="/trips/new"
            className="border-primary text-primary hover:bg-surface inline-flex w-fit items-center gap-1 rounded-md border px-5 py-3 text-sm font-semibold"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden="true" />
            {t('trip.actions.create')}
          </Link>
        </div>
        <TripGrid
          trips={trips.map((trip) => ({
            id: trip.id,
            name: trip.name,
            destination: trip.destination,
            description: trip.description,
            startsOn: trip.startsOn.toISOString().slice(0, 10),
            endsOn: trip.endsOn.toISOString().slice(0, 10),
            timeZone: trip.timeZone,
            status: tripStatus(trip),
            memberCount: trip.memberships.length,
          }))}
        />
      </div>
    </main>
  )
}

export default TripsPage
