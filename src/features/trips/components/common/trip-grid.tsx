'use client'

import { useState } from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight02Icon, Image01Icon } from '@hugeicons/core-free-icons'

import { Link } from '@/i18n/navigation'
import { cn } from '@/utils/cn'

export interface TripListItem {
  id: string
  name: string
  destination: string
  description: string
  startsOn: string
  endsOn: string
  timeZone: string
  status: 'planning' | 'upcoming' | 'ongoing' | 'past' | 'cancelled'
  memberCount: number
}

type Props = {
  trips: TripListItem[]
}

export const TripGrid = ({ trips }: Props): React.JSX.Element => {
  const t = useTranslations('trips')
  const locale = useLocale()
  const format = useFormatter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | TripListItem['status']>('all')
  const visible = trips.filter(
    (trip) =>
      (filter === 'all' || trip.status === filter) &&
      `${trip.name} ${trip.destination}`
        .toLocaleLowerCase(locale)
        .includes(query.trim().toLocaleLowerCase(locale)),
  )
  const filters = ['all', 'planning', 'upcoming', 'ongoing', 'past', 'cancelled'] as const
  return (
    <div className="mt-12">
      <div className="border-line border-b pb-6">
        <label htmlFor="trip-search" className="text-ink text-sm font-semibold">
          {t('list.labels.search')}
        </label>
        <input
          id="trip-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('list.labels.search')}
          className="border-line-strong bg-surface focus-visible:outline-focus mt-2 block h-12 w-full max-w-lg rounded-md border px-4 focus-visible:outline-2"
        />
        <div
          className="mt-5 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label={t('list.labels.filters.all')}
        >
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm',
                filter === item
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-line-strong bg-surface text-ink-soft hover:border-primary',
              )}
            >
              {item === 'all' ? t('list.labels.filters.all') : t(`trip.labels.status.${item}`)}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="border-line-strong bg-surface mt-12 rounded-xl border border-dashed p-12 text-center">
          <h2 className="text-primary text-2xl font-medium">{t('list.messages.empty.title')}</h2>
          <p className="text-ink-soft mt-2">{t('list.messages.empty.description')}</p>
          <Link
            href="/trips/new"
            className="bg-primary text-primary-foreground mt-6 inline-block rounded-md px-5 py-3 text-sm font-semibold"
          >
            {t('trip.actions.create')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="group border-line bg-surface focus-visible:outline-focus overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2"
            >
              <div className="bg-skeleton text-ink-soft flex aspect-[16/10] flex-col items-center justify-center gap-3 text-sm">
                <HugeiconsIcon icon={Image01Icon} size={32} strokeWidth={1.6} aria-hidden="true" />
                <span>{t('list.messages.noCover')}</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-primary text-2xl font-medium tracking-tight">{trip.name}</h2>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs',
                      trip.status === 'planning' && 'bg-champagne-soft text-ink',
                      (trip.status === 'upcoming' || trip.status === 'ongoing') &&
                        'bg-success-bg text-success',
                      trip.status === 'past' && 'bg-muted text-ink-soft',
                      trip.status === 'cancelled' && 'bg-error-bg text-error-text',
                    )}
                  >
                    {t(`trip.labels.status.${trip.status}`)}
                  </span>
                </div>
                <p className="text-ink-soft text-sm">{trip.destination}</p>
                <p className="text-ink-soft mt-3 text-sm">
                  {format.dateTime(new Date(`${trip.startsOn}T00:00:00Z`), {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  })}{' '}
                  —{' '}
                  {format.dateTime(new Date(`${trip.endsOn}T00:00:00Z`), {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  })}{' '}
                  · {trip.timeZone}
                </p>
                {trip.description && (
                  <p className="text-ink-soft mt-4 line-clamp-2 text-sm leading-relaxed">
                    {trip.description}
                  </p>
                )}
                <div className="border-line mt-8 flex items-center justify-between border-t pt-4 text-sm">
                  <span>
                    {trip.memberCount} {t('members.content.title').toLocaleLowerCase(locale)}
                  </span>
                  <span className="text-primary inline-flex items-center gap-1 font-semibold group-hover:underline">
                    {t('list.actions.view')}
                    <HugeiconsIcon icon={ArrowRight02Icon} size={16} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
