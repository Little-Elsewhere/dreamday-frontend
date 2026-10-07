import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { TripLoading } from '@/features/trips/components/trip-loading'
import { TripHeader } from '@/features/trips/components/trip-header'
import { TripsList } from '@/features/trips/components/trips-list'
import { getTrips } from '@/features/trips/data/trips'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips.list')
  return { title: t('title'), description: t('description') }
}

const TripsContent = async (): Promise<ReactElement> => {
  const [t, trips] = await Promise.all([getTranslations('trips.list'), getTrips()])

  return (
    <div className="bg-paper text-ink min-h-svh antialiased">
      <TripHeader showCreate />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <p className="text-champagne-ink text-xs font-semibold tracking-[0.18em] uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="text-primary mt-3 text-4xl leading-tight font-medium tracking-tighter md:text-5xl">
          {t('title')}
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">{t('description')}</p>
        <TripsList trips={trips} />
      </main>
    </div>
  )
}

const Trips = (): ReactElement => (
  <Suspense fallback={<TripLoading variant="list" />}>
    <TripsContent />
  </Suspense>
)

export default Trips
