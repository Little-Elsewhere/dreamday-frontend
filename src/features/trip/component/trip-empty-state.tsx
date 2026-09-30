'use client'

import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

type TripEmptyStateProps = {
  onClearFilters: () => void
}

export function TripEmptyState({ onClearFilters }: TripEmptyStateProps) {
  const t = useTranslations('trips.tripList')

  return (
    <section
      className="border-divider bg-surface grid justify-items-center gap-3 rounded-xl border px-5 py-12 text-center"
      aria-labelledby="empty-title"
    >
      <span className="text-forest" aria-hidden="true">
        <HugeiconsIcon icon={Search01Icon} size={32} strokeWidth={1.8} />
      </span>
      <h2 className="text-empty-title text-forest m-0 font-medium" id="empty-title">
        {t('empty.title')}
      </h2>
      <p className="max-w-empty text-foreground-muted m-0">{t('empty.description')}</p>
      <button
        className="border-border-strong text-forest hover:border-forest hover:bg-page mt-3 min-h-12 rounded-lg border px-5 py-2 font-medium"
        type="button"
        onClick={onClearFilters}
      >
        {t('empty.clearFilters')}
      </button>
    </section>
  )
}
