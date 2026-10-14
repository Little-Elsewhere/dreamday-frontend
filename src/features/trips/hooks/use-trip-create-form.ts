'use client'

import { useTranslations } from 'next-intl'
import { type SubmitEvent, useState } from 'react'

import { ROUTES } from '@/constants/routes'
import { useTripActivities } from '@/features/trips/hooks/use-trip-activities'
import { useTripCover } from '@/features/trips/hooks/use-trip-cover'
import type { TripDraftFormValues } from '@/features/trips/types/components'
import type { TripDraft } from '@/features/trips/types/trip'
import { getTripDatesInRange } from '@/features/trips/utils/trip'
import { useRouter } from '@/i18n/navigation'

export const useTripCreateForm = (initialDraft: TripDraft | null) => {
  const t = useTranslations('trips')
  const router = useRouter()
  const [values, setValues] = useState<TripDraftFormValues>({
    name: initialDraft?.name ?? '',
    destination: initialDraft?.destination ?? '',
    description: initialDraft?.description ?? '',
    startDate: initialDraft?.startDate ?? '',
    endDate: initialDraft?.endDate ?? '',
    pace: initialDraft?.pace ?? '',
    coverPath: initialDraft?.coverPath ?? null,
    note: initialDraft?.note ?? '',
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const dates = getTripDatesInRange(values.startDate, values.endDate)
  const cover = useTripCover(initialDraft?.coverUrl ?? null)
  const activities = useTripActivities({
    initialActivities: initialDraft?.activities ?? [],
    dates,
  })

  const patchValues = (patch: Partial<TripDraftFormValues>) =>
    setValues((current) => ({ ...current, ...patch }))

  const handleSaveDraft = async (): Promise<void> => {
    // TODO: Save the trip draft through the API.
  }

  const handleContinue = (event?: SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }

    // TODO: Save the trip draft through the API.
    setError('')
    setStep(2)
  }

  const handleCover = (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!cover.handlers.chooseCover(file)) setError(t('create.errors.invalidCover'))
  }

  const handleRemoveCover = async (): Promise<void> => {
    // TODO: Persist cover removal through the API.
    cover.handlers.removeCover()
    patchValues({ coverPath: null })
    setError('')
  }

  const handleSaveNote = async (): Promise<void> => {
    // TODO: Save the trip note through the API.
  }

  const handlePublish = async (): Promise<void> => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }

    // TODO: Publish the trip through the API.
  }

  return {
    data: {
      ...activities.data,
      coverUrl: cover.data.coverUrl,
      dates,
      step,
      values,
    },
    handlers: {
      ...activities.handlers,
      handleCancel: () => router.push(ROUTES.PRIVATE.TRIPS),
      handleContinue,
      handleCover,
      handlePublish,
      handleRemoveCover,
      handleSaveDraft,
      handleSaveNote,
      patchValues,
      setStep,
    },
    statuses: {
      error,
      notice: '',
      pending: activities.statuses.isPending,
      coverUploading: cover.statuses.isUploading,
    },
  }
}
