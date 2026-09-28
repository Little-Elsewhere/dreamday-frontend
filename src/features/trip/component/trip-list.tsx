'use client'

import { ArrowRight01Icon, Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cva } from 'class-variance-authority'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type ReactElement } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/utils/cn'

import { trips, type TripId, type TripStatus } from '../data'

type StatusFilter = 'all' | TripStatus

const statusFilters: StatusFilter[] = ['all', 'upcoming', 'planning', 'past']
const statusFilterButtonVariants = cva(
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
  {
    variants: {
      selected: {
        true: 'border-trip-forest bg-trip-forest text-white',
        false:
          'border-trip-border-strong bg-transparent text-trip-muted hover:border-trip-forest hover:text-trip-forest',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export function TripList(): ReactElement {
  const t = useTranslations('page.tripList')
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all')

  const statusLabels: Record<StatusFilter, string> = {
    all: t('filters.statuses.all'),
    upcoming: t('filters.statuses.upcoming'),
    planning: t('filters.statuses.planning'),
    past: t('filters.statuses.past'),
  }

  const tripCopy: Record<
    TripId,
    { title: string; place: string; date: string; duration: string; summary: string }
  > = {
    'da-lat-thang-muoi': {
      title: t('trips.daLatOctober.title'),
      place: t('trips.daLatOctober.place'),
      date: t('trips.daLatOctober.date'),
      duration: t('trips.daLatOctober.duration'),
      summary: t('trips.daLatOctober.summary'),
    },
    'hoi-an-cuoi-thu': {
      title: t('trips.hoiAnAutumn.title'),
      place: t('trips.hoiAnAutumn.place'),
      date: t('trips.hoiAnAutumn.date'),
      duration: t('trips.hoiAnAutumn.duration'),
      summary: t('trips.hoiAnAutumn.summary'),
    },
    'lan-ha-thang-bay': {
      title: t('trips.lanHaJuly.title'),
      place: t('trips.lanHaJuly.place'),
      date: t('trips.lanHaJuly.date'),
      duration: t('trips.lanHaJuly.duration'),
      summary: t('trips.lanHaJuly.summary'),
    },
    'da-lat-cuoi-nam': {
      title: t('trips.daLatYearEnd.title'),
      place: t('trips.daLatYearEnd.place'),
      date: t('trips.daLatYearEnd.date'),
      duration: t('trips.daLatYearEnd.duration'),
      summary: t('trips.daLatYearEnd.summary'),
    },
    'hoi-an-ben-song': {
      title: t('trips.hoiAnRiverside.title'),
      place: t('trips.hoiAnRiverside.place'),
      date: t('trips.hoiAnRiverside.date'),
      duration: t('trips.hoiAnRiverside.duration'),
      summary: t('trips.hoiAnRiverside.summary'),
    },
    'lan-ha-dau-nam': {
      title: t('trips.lanHaNewYear.title'),
      place: t('trips.lanHaNewYear.place'),
      date: t('trips.lanHaNewYear.date'),
      duration: t('trips.lanHaNewYear.duration'),
      summary: t('trips.lanHaNewYear.summary'),
    },
  }

  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredTrips = trips
    .map((trip) => ({ ...trip, ...tripCopy[trip.id], statusLabel: statusLabels[trip.status] }))
    .filter((trip) => {
      const matchesQuery = `${trip.title} ${trip.place}`
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery)
      const matchesStatus = activeStatus === 'all' || trip.status === activeStatus
      return matchesQuery && matchesStatus
    })

  function clearFilters(): void {
    setQuery('')
    setActiveStatus('all')
  }

  return (
    <>
      <section
        className="border-trip-border trip-tablet:grid-cols-trip-filters trip-tablet:items-end mt-8 grid gap-5 border-b pb-6"
        aria-label={t('filters.label')}
      >
        <label className="text-trip-ink grid gap-2 text-sm font-semibold" htmlFor="trip-search">
          {t('filters.searchLabel')}
          <input
            className="border-trip-border-strong bg-trip-surface placeholder:text-trip-placeholder focus:border-trip-forest focus:ring-trip-forest/10 min-h-13 rounded-lg border px-4 py-3 font-normal outline-none focus:ring-4"
            id="trip-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            autoComplete="off"
          />
        </label>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">{t('filters.statusLabel')}</legend>
          <div className="trip-tablet:justify-end flex gap-2 overflow-x-auto pb-0.5">
            {statusFilters.map((status) => {
              const selected = activeStatus === status

              return (
                <button
                  className={cn(statusFilterButtonVariants({ selected }))}
                  key={status}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveStatus(status)}
                >
                  {selected && (
                    <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                  {statusLabels[status]}
                </button>
              )
            })}
          </div>
        </fieldset>
      </section>

      <div className="my-6 flex items-baseline justify-between gap-4">
        <h2 className="text-trip-forest m-0 text-xl font-medium">{t('list.title')}</h2>
        <p className="text-trip-muted m-0 text-sm" aria-live="polite">
          {t('list.count', { count: filteredTrips.length })}
        </p>
      </div>

      {filteredTrips.length > 0 ? (
        <ul className="trip-tablet:grid-cols-2 trip-wide:grid-cols-3 m-0 grid list-none gap-5 p-0">
          {filteredTrips.map((trip) => (
            <li className="min-w-0" key={trip.id}>
              <Link
                className="group border-trip-border bg-trip-surface text-trip-ink shadow-trip-card hover:border-trip-border-strong hover:shadow-trip-card-hover grid overflow-hidden rounded-xl border no-underline transition hover:-translate-y-0.5"
                href={{ pathname: '/#', query: { trip: trip.id } }}
              >
                <div className="aspect-trip-card bg-trip-card-art flex items-end p-4">
                  <span className="bg-trip-forest/85 rounded-full px-3 py-1 text-xs text-white">
                    {trip.place}
                  </span>
                </div>
                <div className="grid content-start gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-trip-card-title text-trip-forest m-0 font-medium tracking-tight">
                      {trip.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${trip.status === 'upcoming' ? 'bg-trip-status-upcoming text-trip-status-upcoming-ink' : trip.status === 'planning' ? 'bg-trip-status-planning text-trip-status-planning-ink' : 'bg-trip-status-past text-trip-status-past-ink'}`}
                    >
                      {trip.statusLabel}
                    </span>
                  </div>
                  <p className="text-trip-card-date text-trip-ink m-0">{trip.date}</p>
                  <p className="text-trip-muted m-0 line-clamp-3 text-sm leading-relaxed">
                    {trip.summary}
                  </p>
                  <div className="border-trip-border text-trip-card-action text-trip-muted flex items-center justify-between gap-3 border-t pt-4">
                    <span>{trip.duration}</span>
                    <strong className="text-trip-forest inline-flex items-center gap-1">
                      {t('actions.viewDetails')}
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </strong>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section
          className="border-trip-border bg-trip-surface grid justify-items-center gap-3 rounded-xl border px-5 py-12 text-center"
          aria-labelledby="empty-title"
        >
          <span className="text-trip-forest" aria-hidden="true">
            <HugeiconsIcon icon={Search01Icon} size={32} strokeWidth={1.8} />
          </span>
          <h2 className="text-trip-empty-title text-trip-forest m-0 font-medium" id="empty-title">
            {t('empty.title')}
          </h2>
          <p className="max-w-trip-empty text-trip-muted m-0">{t('empty.description')}</p>
          <button
            className="border-trip-border-strong text-trip-forest hover:border-trip-forest hover:bg-trip-page mt-3 min-h-12 rounded-lg border px-5 py-2 font-medium"
            type="button"
            onClick={clearFilters}
          >
            {t('empty.clearFilters')}
          </button>
        </section>
      )}
    </>
  )
}
