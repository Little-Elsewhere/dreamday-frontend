'use client'

import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import type { TripId, TripStatus } from '../mocks/data'

export type TripCardData = {
  id: TripId
  title: string
  place: string
  duration: string
  summary: string
  date: string
  status: TripStatus
  statusLabel: string
}

export function TripCard({ trip }: { trip: TripCardData }) {
  const t = useTranslations('trips.tripList')

  return (
    <Link
      className="group border-divider bg-surface text-ink shadow-card hover:border-border-strong hover:shadow-card-hover grid overflow-hidden rounded-xl border no-underline transition hover:-translate-y-0.5"
      href={{ pathname: '/# ', query: { trip: trip.id } }}
    >
      <div className="aspect-card bg-card-art flex items-end p-4">
        <span className="bg-forest/85 rounded-full px-3 py-1 text-xs text-white">{trip.place}</span>
      </div>
      <div className="grid content-start gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-card-title text-forest m-0 font-medium tracking-tight">
            {trip.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${trip.status === 'upcoming' ? 'bg-status-upcoming text-status-upcoming-ink' : trip.status === 'planning' ? 'bg-status-planning text-status-planning-ink' : 'bg-status-past text-status-past-ink'}`}
          >
            {trip.statusLabel}
          </span>
        </div>
        <p className="text-card-date text-ink m-0">{trip.date}</p>
        <p className="text-foreground-muted m-0 line-clamp-3 text-sm leading-relaxed">
          {trip.summary}
        </p>
        <div className="border-divider text-card-action text-foreground-muted flex items-center justify-between gap-3 border-t pt-4">
          <span>{trip.duration}</span>
          <strong className="text-forest inline-flex items-center gap-1">
            {t('actions.viewDetails')}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} aria-hidden="true" />
          </strong>
        </div>
      </div>
    </Link>
  )
}
