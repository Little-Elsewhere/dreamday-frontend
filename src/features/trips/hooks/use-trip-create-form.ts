'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import type { TripDraftFormValues } from '@/features/trips/types/components'
import type { TripDraft } from '@/features/trips/types/trip'
import { PUBLISH_ERROR_TRANSLATION_KEYS } from '@/features/trips/constants/trips'
import { publishTrip, saveTripDraft, saveTripNote } from '@/features/trips/actions/trips'
import { getTripDetailRoute, ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { useTripActivities } from '@/features/trips/hooks/use-trip-activities'
import { useTripCover } from '@/features/trips/hooks/use-trip-cover'
import { getTripDatesInRange } from '@/features/trips/utils/trip'

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
  const [draftId, setDraftId] = useState<string | null>(initialDraft?.id ?? null)
  const [step, setStep] = useState(1)
  const [formPending, setFormPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const dates = getTripDatesInRange(values.startDate, values.endDate)
  const cover = useTripCover(initialDraft?.coverUrl ?? null)
  const activities = useTripActivities({
    initialActivities: initialDraft?.activities ?? [],
    tripId: draftId,
    dates,
    setError,
  })
  const pending = formPending || activities.statuses.isPending

  const patchValues = (patch: Partial<TripDraftFormValues>): void =>
    setValues((current) => ({ ...current, ...patch }))

  const onDraftSaved = (coverPath: string | null, savedDraftId: string): void => {
    patchValues({ coverPath })
    setDraftId(savedDraftId)
  }

  const persistDraft = async (showNotice = true): Promise<string | null> => {
    setError('')
    const result = await saveTripDraft({ ...values })
    if (!result.success) {
      setError(t('errors.saveFailed'))
      return null
    }

    setDraftId(result.data.id)
    if (showNotice) setNotice(t('create.draftSaved'))
    return result.data.id
  }

  const persistPendingCover = async (tripId: string): Promise<boolean> => {
    const saved = await cover.handlers.persistPendingCover(tripId, values, onDraftSaved)
    if (!saved) setError(t('create.errors.coverUploadFailed'))
    return saved
  }

  const handleSaveDraft = async (): Promise<void> => {
    setFormPending(true)
    try {
      const tripId = await persistDraft()
      if (tripId) await persistPendingCover(tripId)
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setFormPending(false)
    }
  }

  const handleContinue = async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
    event?.preventDefault()
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }

    setFormPending(true)
    try {
      const tripId = await persistDraft()
      if (tripId) {
        setStep(2)
        setError('')
      }
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setFormPending(false)
    }
  }

  const handleCover = (file: File | undefined): void => {
    if (!file) return

    setNotice('')
    setError('')
    if (!cover.handlers.chooseCover(file)) setError(t('create.errors.invalidCover'))
  }

  const handleRemoveCover = async (): Promise<void> => {
    if (!values.coverPath) {
      if (!cover.handlers.clearPendingCover()) return
      setError('')
      setNotice('')
      return
    }

    setFormPending(true)
    setError('')
    setNotice('')
    try {
      const saved = await cover.handlers.removeSavedCover(values, onDraftSaved)
      if (!saved) setError(t('errors.saveFailed'))
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setFormPending(false)
    }
  }

  const handleSaveNote = async (): Promise<void> => {
    if (!draftId) {
      await handleSaveDraft()
      return
    }

    setFormPending(true)
    setError('')
    setNotice('')
    try {
      const result = await saveTripNote({ tripId: draftId, note: values.note })
      if (!result.success) {
        setError(t('errors.saveFailed'))
        return
      }
      setNotice(t('create.noteSaved'))
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setFormPending(false)
    }
  }

  const handlePublish = async (): Promise<void> => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }

    setFormPending(true)
    setError('')
    try {
      const tripId = await persistDraft(false)
      if (!tripId || !(await persistPendingCover(tripId))) return

      const result = await publishTrip({ tripId })
      if (!result.success) {
        if (result.error.kind === 'system') {
          setError(t('errors.saveFailed'))
          return
        }
        if (result.error.kind === 'message') {
          setError(
            result.error.key === 'trips.errors.sessionExpired'
              ? t('errors.sessionExpired')
              : t('errors.saveFailed'),
          )
          return
        }

        const translationKey =
          PUBLISH_ERROR_TRANSLATION_KEYS[result.error.key] ?? 'create.errors.publishRequired'
        setError(t(translationKey))
        return
      }

      router.push(getTripDetailRoute(result.data.id))
      router.refresh()
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setFormPending(false)
    }
  }

  return {
    data: {
      ...activities.data,
      coverUrl: cover.data.coverUrl,
      dates,
      draftId,
      step,
      values,
    },
    handlers: {
      ...activities.handlers,
      handleCancel: (): void => router.push(ROUTES.PRIVATE.TRIPS),
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
      pending,
      coverUploading: cover.statuses.isUploading,
    },
  }
}
