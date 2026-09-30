'use client'

import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cva } from 'class-variance-authority'
import { useTranslations } from 'next-intl'

import { cn } from '@/utils/cn'

import type { TripStatus } from '../mocks/data'

export type StatusFilter = 'all' | TripStatus

const statusFilters: StatusFilter[] = ['all', 'upcoming', 'planning', 'past']
const statusFilterButtonVariants = cva(
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
  {
    variants: {
      selected: {
        true: 'border-forest bg-forest text-white',
        false:
          'border-border-strong bg-transparent text-foreground-muted hover:border-forest hover:text-forest',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

type TripSearchFiltersProps = {
  query: string
  activeStatus: StatusFilter
  onQueryChange: (query: string) => void
  onStatusChange: (status: StatusFilter) => void
}

export function TripSearchFilters({
  query,
  activeStatus,
  onQueryChange,
  onStatusChange,
}: TripSearchFiltersProps) {
  const t = useTranslations('trips.tripList')

  const statusLabels: Record<StatusFilter, string> = {
    all: t('filters.statuses.all'),
    upcoming: t('filters.statuses.upcoming'),
    planning: t('filters.statuses.planning'),
    past: t('filters.statuses.past'),
  }

  return (
    <section
      className="border-divider tablet:grid-cols-filters tablet:items-end mt-8 grid gap-5 border-b pb-6"
      aria-label={t('filters.label')}
    >
      <label className="text-ink grid gap-2 text-sm font-semibold" htmlFor="trip-search">
        {t('filters.searchLabel')}
        <input
          className="border-border-strong bg-surface placeholder:text-placeholder focus:border-forest focus:ring-forest/10 min-h-13 rounded-lg border px-4 py-3 font-normal outline-none focus:ring-4"
          id="trip-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          autoComplete="off"
        />
      </label>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="sr-only">{t('filters.statusLabel')}</legend>
        <div className="tablet:justify-end flex gap-2 overflow-x-auto pb-0.5">
          {statusFilters.map((status) => {
            const selected = activeStatus === status

            return (
              <button
                className={cn(statusFilterButtonVariants({ selected }))}
                key={status}
                type="button"
                aria-pressed={selected}
                onClick={() => onStatusChange(status)}
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
  )
}
