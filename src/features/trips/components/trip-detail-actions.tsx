'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { softDeleteTrip } from '@/features/trips/actions/trips'
import { Link, useRouter } from '@/i18n/navigation'
import { cn } from '@/utils/cn'

type Props = {
  tripId: string
}

export const TripDetailActions = ({ tripId }: Props) => {
  const t = useTranslations('trips.detail')
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!window.confirm(t('actions.deleteConfirm'))) return
    setError('')
    startTransition(async () => {
      const result = await softDeleteTrip(tripId)
      if (!result.success) {
        setError(t('errors.deleteFailed'))
        return
      }
      router.push(ROUTES.PRIVATE.TRIPS)
      router.refresh()
    })
  }

  return (
    <div className="grid gap-3">
      {error && <p className="text-error-text text-sm">{error}</p>}
      <Link
        prefetch
        className={buttonVariants({ className: 'w-full', variant: 'outline' })}
        href={ROUTES.PRIVATE.TRIP_EDIT(tripId)}
      >
        {t('actions.edit')}
      </Link>
      <Button
        className={cn('w-full')}
        disabled={pending}
        onClick={handleDelete}
        type="button"
        variant="outline"
      >
        {pending ? t('actions.deleting') : t('actions.delete')}
      </Button>
    </div>
  )
}
