'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { restoreTrip } from '@/features/trips/actions/trips'
import type { TripCard } from '@/features/trips/types/trip'
import { useRouter } from '@/i18n/navigation'

type Props = {
  trips: TripCard[]
}

export const TripsTrash = ({ trips }: Props) => {
  const t = useTranslations('trips.list')
  const router = useRouter()
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (trips.length === 0) return null

  const handleRestore = (tripId: string) => {
    setError('')
    setPendingId(tripId)
    startTransition(async () => {
      const result = await restoreTrip(tripId)
      setPendingId(null)
      if (!result.success) {
        setError(t('trash.restoreFailed'))
        return
      }
      router.refresh()
    })
  }

  return (
    <section className="border-line mt-12 border-t pt-10">
      <p className="text-champagne-ink text-xs font-semibold tracking-[0.16em] uppercase">
        {t('trash.eyebrow')}
      </p>
      <h2 className="text-primary mt-2 text-2xl font-medium tracking-tight">{t('trash.title')}</h2>
      <p className="text-ink-soft mt-2 max-w-xl text-sm leading-relaxed">
        {t('trash.description')}
      </p>
      {error && <p className="text-error-text mt-4 text-sm">{error}</p>}
      <ul className="mt-6 grid gap-3">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className="border-line bg-surface flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-primary font-medium">{trip.name || t('trash.untitled')}</p>
              <p className="text-ink-soft text-sm">{trip.destination}</p>
            </div>
            <Button
              disabled={pending && pendingId === trip.id}
              onClick={() => handleRestore(trip.id)}
              type="button"
              variant="outline"
            >
              {pending && pendingId === trip.id ? t('trash.restoring') : t('trash.restore')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
