'use client'

import Image from 'next/image'
import { Search01Icon, Image01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Button, buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { Link } from '@/i18n/navigation'
import { TRIP_LIST_FILTERS, TRIP_LIST_PAGE_SIZE } from '@/features/trips/constants/trips'
import { filterTrips, formatTripDate } from '@/features/trips/utils/trip'
import type { TripCard, TripListFilter } from '@/features/trips/types/trip'

type Props = {
  trips: TripCard[]
}

export const TripsList = ({ trips }: Props): ReactElement => {
  const t = useTranslations('trips')
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TripListFilter>('all')
  const [visibleState, setVisibleState] = useState({
    filter: 'all' as TripListFilter,
    query: '',
    count: TRIP_LIST_PAGE_SIZE,
  })
  const visibleCount =
    visibleState.filter === filter && visibleState.query === query
      ? visibleState.count
      : TRIP_LIST_PAGE_SIZE
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filteredTrips = filterTrips(trips, query, filter, locale)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || visibleCount >= filteredTrips.length) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleState((current) => ({
            filter,
            query,
            count: Math.min(
              (current.filter === filter && current.query === query
                ? current.count
                : TRIP_LIST_PAGE_SIZE) + TRIP_LIST_PAGE_SIZE,
              filteredTrips.length,
            ),
          }))
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filter, filteredTrips.length, query, visibleCount])

  return (
    <>
      <section
        aria-label={t('list.toolbarLabel')}
        className="border-line mt-8 grid gap-5 border-b pb-6 md:grid-cols-[minmax(17.5rem,26.25rem)_1fr] md:items-end"
      >
        <label className="grid gap-2">
          <span className="text-ink text-sm font-semibold">{t('list.searchLabel')}</span>
          <span className="group relative block">
            <HugeiconsIcon
              aria-hidden="true"
              className="text-ink-soft group-focus-within:text-primary pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 transition-colors"
              icon={Search01Icon}
              size={20}
              strokeWidth={1.7}
            />
            <input
              className="border-line-strong bg-surface text-ink placeholder:text-ink-soft focus-visible:border-primary focus-visible:ring-primary/15 rounded-auth hover:border-primary min-h-[3.25rem] w-full border py-3 pr-4 pl-12 text-base transition outline-none focus-visible:ring-3"
              id="trip-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('list.searchPlaceholder')}
              type="search"
              value={query}
            />
          </span>
        </label>

        <div
          aria-label={t('list.filterLabel')}
          className="flex min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto py-0.5 md:justify-end [&::-webkit-scrollbar]:hidden"
          role="group"
        >
          {TRIP_LIST_FILTERS.map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              className={`focus-visible:outline-focus min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                filter === value
                  ? 'border-primary bg-primary text-white'
                  : 'border-line-strong text-ink-soft hover:border-primary hover:text-primary bg-transparent'
              }`}
              onClick={() => setFilter(value)}
              type="button"
            >
              {t(`list.filters.${value}`)}
            </button>
          ))}
        </div>
      </section>

      {filteredTrips.length === 0 ? (
        <section className="border-line bg-surface rounded-auth mt-8 border px-6 py-16 text-center sm:py-20">
          <span
            aria-hidden="true"
            className="text-primary bg-muted mx-auto grid size-14 place-items-center rounded-full"
          >
            <HugeiconsIcon icon={Search01Icon} size={28} strokeWidth={1.6} />
          </span>
          <h2 className="text-primary mt-5 text-2xl font-medium tracking-tight">
            {trips.length === 0 ? t('list.emptyTitle') : t('list.noResultsTitle')}
          </h2>
          <p className="text-ink-soft mx-auto mt-3 max-w-lg leading-relaxed">
            {trips.length === 0 ? t('list.emptyDescription') : t('list.noResultsDescription')}
          </p>
          {trips.length === 0 ? (
            <Link
              className={buttonVariants({ className: 'mt-7' })}
              href={ROUTES.PRIVATE.TRIP_CREATE}
            >
              {t('list.createFirst')}
            </Link>
          ) : (
            <Button
              className="mt-7"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
              variant="outline"
            >
              {t('list.clearFilters')}
            </Button>
          )}
        </section>
      ) : (
        <>
          <div className="mt-6 flex items-baseline justify-between gap-4">
            <h2 className="text-primary text-xl font-medium">{t('list.resultsTitle')}</h2>
            <p aria-live="polite" className="text-ink-soft text-sm">
              {t('list.resultCount', { count: filteredTrips.length })}
            </p>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.slice(0, visibleCount).map((trip) => (
              <Link
                key={trip.id}
                aria-label={t('list.openTrip', { name: trip.name })}
                className="group border-line bg-surface focus-visible:outline-focus rounded-auth hover:border-line-strong overflow-hidden border shadow-[0_8px_28px_rgba(23,54,46,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(23,54,46,0.1)] focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transform-none motion-reduce:transition-none"
                href={ROUTES.PRIVATE.TRIP_DETAIL(trip.id)}
              >
                <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                  {trip.coverUrl ? (
                    <Image
                      alt=""
                      className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      src={trip.coverUrl}
                      unoptimized
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="text-ink-soft bg-muted flex h-full flex-col items-center justify-center gap-3 text-sm"
                    >
                      <HugeiconsIcon icon={Image01Icon} size={32} strokeWidth={1.6} />
                      <span>{t('list.coverMissing')}</span>
                    </div>
                  )}
                </div>
                <div className="grid content-start gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-primary text-[1.375rem] leading-snug font-medium tracking-tight break-words">
                        {trip.name}
                      </h3>
                      <p className="text-champagne-ink mt-1 text-xs font-semibold tracking-[0.14em] uppercase">
                        {trip.destination}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        trip.status === 'upcoming'
                          ? 'bg-success-bg text-success'
                          : 'bg-muted text-ink-soft'
                      }`}
                    >
                      {t(`list.status.${trip.status}`)}
                    </span>
                  </div>
                  <p className="text-ink text-sm">
                    {formatTripDate(trip.startDate, locale)} –{' '}
                    {formatTripDate(trip.endDate, locale)}
                  </p>
                  <p className="text-ink-soft line-clamp-3 min-h-0 text-sm leading-relaxed">
                    {trip.description || t('list.noDescription')}
                  </p>
                  <div className="border-line mt-1 flex items-center justify-between gap-3 border-t pt-4 text-sm">
                    <span className="text-ink-soft">
                      {t('list.days', { count: trip.durationDays })}
                    </span>
                    <span className="text-primary inline-flex items-center gap-1.5 font-semibold">
                      {t('list.viewDetails')}
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        icon={ArrowRight01Icon}
                        size={16}
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {visibleCount < filteredTrips.length && (
            <div className="mt-6 grid min-h-8 justify-items-center">
              <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
              <p aria-live="polite" className="text-ink-soft -mt-2 text-center text-xs">
                {t('list.paginationStatus', { shown: visibleCount, total: filteredTrips.length })}
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
