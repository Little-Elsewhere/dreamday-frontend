'use client'

import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { lazy, Suspense, useState, type ReactElement } from 'react'

import { trips, type TripId, type TripStatus } from '../mocks/data'
import type { TripCardData } from './trip-card'
import { TripEmptyState } from './trip-empty-state'
import { TripSearchFilters, type StatusFilter } from './trip-search-filters'

const TripCard = lazy(() => import('./trip-card').then(({ TripCard }) => ({ default: TripCard })))
const initialTripCount = 3
type TripCopy = Pick<TripCardData, 'title' | 'place' | 'duration' | 'summary'>

export function TripList(): ReactElement {
  const t = useTranslations('trips.tripList')
  const formatter = useFormatter()
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all')
  const [visibleTripCount, setVisibleTripCount] = useState(initialTripCount)

  const tripCopy: Record<TripId, TripCopy> = {
    'da-lat-thang-muoi': {
      title: t('trips.daLatOctober.title'),
      place: t('trips.daLatOctober.place'),
      duration: t('trips.daLatOctober.duration'),
      summary: t('trips.daLatOctober.summary'),
    },
    'hoi-an-cuoi-thu': {
      title: t('trips.hoiAnAutumn.title'),
      place: t('trips.hoiAnAutumn.place'),
      duration: t('trips.hoiAnAutumn.duration'),
      summary: t('trips.hoiAnAutumn.summary'),
    },
    'lan-ha-thang-bay': {
      title: t('trips.lanHaJuly.title'),
      place: t('trips.lanHaJuly.place'),
      duration: t('trips.lanHaJuly.duration'),
      summary: t('trips.lanHaJuly.summary'),
    },
    'da-lat-cuoi-nam': {
      title: t('trips.daLatYearEnd.title'),
      place: t('trips.daLatYearEnd.place'),
      duration: t('trips.daLatYearEnd.duration'),
      summary: t('trips.daLatYearEnd.summary'),
    },
    'hoi-an-ben-song': {
      title: t('trips.hoiAnRiverside.title'),
      place: t('trips.hoiAnRiverside.place'),
      duration: t('trips.hoiAnRiverside.duration'),
      summary: t('trips.hoiAnRiverside.summary'),
    },
    'lan-ha-dau-nam': {
      title: t('trips.lanHaNewYear.title'),
      place: t('trips.lanHaNewYear.place'),
      duration: t('trips.lanHaNewYear.duration'),
      summary: t('trips.lanHaNewYear.summary'),
    },
  }

  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredTrips = trips
    .map((trip) => ({
      ...trip,
      ...tripCopy[trip.id],
      date: formatter.dateTimeRange(trip.startDate, trip.endDate, {
        dateStyle: 'long',
        timeZone: 'UTC',
      }),
      statusLabel: t(`filters.statuses.${trip.status}`),
    }))
    .filter((trip) => {
      const matchesQuery = `${trip.title} ${trip.place}`
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery)
      const matchesStatus = activeStatus === 'all' || trip.status === activeStatus
      return matchesQuery && matchesStatus
    })
  const visibleTrips = filteredTrips.slice(0, visibleTripCount)

  function clearFilters(): void {
    setQuery('')
    setActiveStatus('all')
    setVisibleTripCount(initialTripCount)
  }

  function handleQueryChange(nextQuery: string): void {
    setQuery(nextQuery)
    setVisibleTripCount(initialTripCount)
  }

  function handleStatusChange(status: StatusFilter): void {
    setActiveStatus(status)
    setVisibleTripCount(initialTripCount)
  }

  return (
    <>
      <TripSearchFilters
        query={query}
        activeStatus={activeStatus}
        onQueryChange={handleQueryChange}
        onStatusChange={handleStatusChange}
      />

      <div className="my-6 flex items-baseline justify-between gap-4">
        <h2 className="text-forest m-0 text-xl font-medium">{t('list.title')}</h2>
        <p className="text-foreground-muted m-0 text-sm" aria-live="polite">
          {t('list.count', { count: filteredTrips.length })}
        </p>
      </div>

      {filteredTrips.length > 0 ? (
        <ul className="tablet:grid-cols-2 wide:grid-cols-3 m-0 grid list-none gap-5 p-0">
          {visibleTrips.map((trip) => (
            <li className="min-w-0" key={trip.id}>
              <Suspense fallback={<TripCardFallback label={t('loading')} />}>
                <TripCard trip={trip} />
              </Suspense>
            </li>
          ))}
        </ul>
      ) : (
        <TripEmptyState onClearFilters={clearFilters} />
      )}

      {visibleTrips.length < filteredTrips.length && (
        <div className="mt-8 flex justify-center">
          <button
            className="border-border-strong bg-surface text-forest hover:bg-page min-h-11 rounded-lg border px-5 py-2 text-sm font-medium transition-colors"
            type="button"
            onClick={() => setVisibleTripCount((count) => count + initialTripCount)}
          >
            {t('actions.loadMore')}
          </button>
        </div>
      )}
    </>
  )
}

function TripCardFallback({ label }: { label: string }): ReactElement {
  return (
    <div
      className="border-divider bg-surface animate-pulse overflow-hidden rounded-xl border"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        {label}
      </span>
      <div className="aspect-card bg-divider" aria-hidden="true" />
      <div className="grid gap-4 p-5" aria-hidden="true">
        <div className="bg-divider h-5 w-2/3 rounded" />
        <div className="bg-divider h-4 w-1/3 rounded" />
        <div className="bg-divider h-12 rounded" />
        <div className="bg-divider h-4 rounded" />
      </div>
    </div>
  )
}
