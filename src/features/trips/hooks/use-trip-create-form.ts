'use client'

import { useTranslations } from 'next-intl'
import { type SubmitEvent, useState } from 'react'

import { ROUTES } from '@/constants/routes'
import {
  deleteTripActivity,
  ensureTripId,
  publishTrip,
  removeTripCover,
  saveDraft,
  saveTripActivity,
  saveTripNote,
  uploadTripCover,
} from '@/features/trips/actions/trips'
import { TRIP_APP_TIME_ZONE } from '@/features/trips/constants/trips'
import { useTripActivities } from '@/features/trips/hooks/use-trip-activities'
import { useTripCover } from '@/features/trips/hooks/use-trip-cover'
import type { TripDraftFormValues } from '@/features/trips/types/components'
import type { TripDraft } from '@/features/trips/types/trip'
import { getTripDatesInRange } from '@/features/trips/utils/trip'
import { useRouter } from '@/i18n/navigation'

export const useTripCreateForm = (initialDraft: TripDraft | null) => {
  const t = useTranslations('trips')
  const router = useRouter()
  const [tripId, setTripId] = useState<string | null>(initialDraft?.id ?? null)
  const [values, setValues] = useState<TripDraftFormValues>({
    name: initialDraft?.name ?? '',
    destination: initialDraft?.destination ?? '',
    description: initialDraft?.description ?? '',
    startDate: initialDraft?.startDate ?? '',
    endDate: initialDraft?.endDate ?? '',
    pace: initialDraft?.pace ?? '',
    timezone: initialDraft?.timezone ?? TRIP_APP_TIME_ZONE,
    coverPath: initialDraft?.coverPath ?? null,
    note: initialDraft?.note ?? '',
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const dates = getTripDatesInRange(values.startDate, values.endDate)
  const cover = useTripCover(initialDraft?.coverUrl ?? null)
  const activities = useTripActivities({
    initialActivities: initialDraft?.activities ?? [],
    dates,
  })

  const patchValues = (patch: Partial<TripDraftFormValues>) =>
    setValues((current) => ({ ...current, ...patch }))

  const draftPayload = () => ({
    tripId: tripId ?? undefined,
    name: values.name,
    destination: values.destination,
    description: values.description,
    startDate: values.startDate,
    endDate: values.endDate,
    pace: values.pace,
    note: values.note,
    timezone: values.timezone || TRIP_APP_TIME_ZONE,
  })

  const ensureId = async () => {
    const result = await ensureTripId(tripId, draftPayload())
    if (!result.success) {
      const key =
        result.error.kind === 'message'
          ? result.error.key.replace(/^trips\./, '')
          : 'create.errors.system'
      setError(t(key as 'create.errors.system'))
      return null
    }
    setTripId(result.data.tripId)
    return result.data.tripId
  }

  const handleSaveDraft = async (): Promise<void> => {
    setPending(true)
    setError('')
    const result = await saveDraft(draftPayload())
    setPending(false)
    if (!result.success) {
      setError(
        t(
          result.error.kind === 'message'
            ? result.error.key.replace(/^trips\./, '')
            : 'create.errors.system',
        ),
      )
      return
    }
    setTripId(result.data.id)
    setNotice(t('create.draftSaved'))
  }

  const handleContinue = (event?: SubmitEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }

    setError('')
    setStep(2)
  }

  const handleCover = async (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!cover.handlers.chooseCover(file)) {
      setError(t('create.errors.invalidCover'))
      return
    }

    cover.handlers.setUploading?.(true)
    setPending(true)
    const id = await ensureId()
    if (!id) {
      setPending(false)
      cover.handlers.setUploading?.(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    const result = await uploadTripCover(id, formData)
    setPending(false)
    cover.handlers.setUploading?.(false)

    if (!result.success) {
      setError(t('create.errors.coverUploadFailed'))
      return
    }

    patchValues({ coverPath: result.data.coverPath })
    cover.handlers.setRemoteUrl?.(result.data.coverUrl)
    setNotice(t('create.coverUploaded'))
  }

  const handleRemoveCover = async (): Promise<void> => {
    cover.handlers.removeCover()
    patchValues({ coverPath: null })
    setError('')
    if (!tripId) return
    setPending(true)
    await removeTripCover(tripId)
    setPending(false)
  }

  const handleSaveNote = async (): Promise<void> => {
    setPending(true)
    setError('')
    const id = await ensureId()
    if (!id) {
      setPending(false)
      return
    }
    const result = await saveTripNote(id, values.note)
    setPending(false)
    if (!result.success) {
      setError(t('create.errors.system'))
      return
    }
    setNotice(t('create.noteSaved'))
  }

  const syncActivities = async (id: string) => {
    const remoteIds = new Set((initialDraft?.activities ?? []).map((item) => item.id))
    for (const activity of activities.data.activities) {
      const result = await saveTripActivity({
        tripId: id,
        activityId: remoteIds.has(activity.id) ? activity.id : undefined,
        title: activity.title,
        activityDate: activity.activityDate,
        activityType: activity.activityType,
        startMinute: activity.startMinute,
        endMinute: activity.endMinute,
        note: activity.note,
      })
      if (!result.success) return result
    }

    for (const existing of initialDraft?.activities ?? []) {
      if (!activities.data.activities.some((item) => item.id === existing.id)) {
        const result = await deleteTripActivity(id, existing.id)
        if (!result.success) return result
      }
    }

    return { success: true as const, data: { synced: true } }
  }

  const handlePublish = async (): Promise<void> => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }
    if (!values.name.trim() || !values.startDate || !values.endDate || !values.pace) {
      setError(t('create.errors.publishRequired'))
      return
    }

    setPending(true)
    setError('')
    const id = await ensureId()
    if (!id) {
      setPending(false)
      return
    }

    const synced = await syncActivities(id)
    if (!synced.success) {
      setPending(false)
      setError(
        t(
          synced.error.kind === 'message'
            ? synced.error.key.replace(/^trips\./, '')
            : 'create.errors.activitySaveFailed',
        ),
      )
      return
    }

    const result = await publishTrip(id, {
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      pace: values.pace,
      timezone: values.timezone || TRIP_APP_TIME_ZONE,
    })
    setPending(false)
    if (!result.success) {
      setError(
        t(
          result.error.kind === 'message'
            ? result.error.key.replace(/^trips\./, '')
            : 'create.errors.publishRequired',
        ),
      )
      return
    }

    router.push(ROUTES.PRIVATE.TRIP_DETAIL(result.data.id))
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
      notice,
      pending: pending || activities.statuses.isPending,
      coverUploading: cover.statuses.isUploading,
    },
  }
}
