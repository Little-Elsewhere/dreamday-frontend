'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import type { TripActivityFormValues, TripDraftFormValues } from '@/features/trips/types/components'
import type { TripActivity, TripDraft } from '@/features/trips/types/trip'
import {
  MAX_TRIP_COVER_SIZE_BYTES,
  PUBLISH_ERROR_TRANSLATION_KEYS,
} from '@/features/trips/constants/trips'
import {
  deleteTripActivity,
  publishTrip,
  saveTripActivity,
  saveTripDraft,
  saveTripNote,
} from '@/features/trips/actions/trips'
import {
  createInitialTripActivity,
  createUuidV4,
  getTripDatesInRange,
  sortTripActivities,
} from '@/features/trips/utils/trip'
import { getTripDetailRoute, ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

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
  const [coverUrl, setCoverUrl] = useState<string | null>(initialDraft?.coverUrl ?? null)
  const coverPreviewUrlRef = useRef<string | null>(null)
  const [activities, setActivities] = useState<TripActivity[]>(initialDraft?.activities ?? [])
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityValues, setActivityValues] = useState<TripActivityFormValues>(
    createInitialTripActivity(''),
  )
  const dates = getTripDatesInRange(values.startDate, values.endDate)

  useEffect(
    () => () => {
      if (coverPreviewUrlRef.current) URL.revokeObjectURL(coverPreviewUrlRef.current)
    },
    [],
  )

  const patchValues = (patch: Partial<TripDraftFormValues>): void =>
    setValues((current) => ({ ...current, ...patch }))

  const patchActivityValues = (patch: Partial<TripActivityFormValues>): void =>
    setActivityValues((current) => ({ ...current, ...patch }))

  const handleCancel = (): void => router.push(ROUTES.PRIVATE.TRIPS)

  const payload = () => ({ ...values })

  const persistDraft = async (showNotice = true): Promise<string | null> => {
    setError('')
    const result = await saveTripDraft(payload())
    if (!result.success) {
      setError(t('errors.saveFailed'))
      return null
    }
    setDraftId(result.data.id)
    if (showNotice) setNotice(t('create.draftSaved'))
    return result.data.id
  }

  const handleSaveDraft = async (): Promise<void> => {
    setPending(true)
    try {
      await persistDraft()
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setPending(false)
    }
  }

  const handleContinue = async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
    event?.preventDefault()
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }
    setPending(true)
    try {
      const id = await persistDraft()
      if (id) {
        setStep(2)
        setError('')
      }
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setPending(false)
    }
  }

  const handleCover = async (file: File | undefined): Promise<void> => {
    if (!file) return
    setNotice('')
    setError('')
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > MAX_TRIP_COVER_SIZE_BYTES
    ) {
      setError(t('create.errors.invalidCover'))
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const previousPreviewUrl = coverPreviewUrlRef.current
    const previousCoverUrl = coverUrl
    coverPreviewUrlRef.current = previewUrl
    setCoverUrl(previewUrl)
    setPending(true)
    setCoverUploading(true)

    const restorePreview = (): void => {
      if (coverPreviewUrlRef.current === previewUrl) {
        coverPreviewUrlRef.current = previousPreviewUrl
      }
      URL.revokeObjectURL(previewUrl)
      setCoverUrl(previousCoverUrl)
    }

    try {
      const id = draftId ?? (await persistDraft(false))
      if (!id) {
        restorePreview()
        return
      }
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Missing user')
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.slice('image/'.length)
      const path = `${user.id}/${id}/${createUuidV4()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('trip-covers').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) throw new Error('Upload failed')
      const previousPath = values.coverPath
      const result = await saveTripDraft({ ...payload(), coverPath: path })
      if (!result.success) {
        await supabase.storage.from('trip-covers').remove([path])
        throw new Error('Could not save cover')
      }
      patchValues({ coverPath: path })
      setDraftId(result.data.id)
      setNotice(t('create.coverUploaded'))
      if (previousPreviewUrl) URL.revokeObjectURL(previousPreviewUrl)
      if (previousPath) {
        try {
          await supabase.storage.from('trip-covers').remove([previousPath])
        } catch {
          // The new cover is already saved, so a cleanup failure does not invalidate it.
        }
      }
    } catch {
      restorePreview()
      setError(t('create.errors.coverUploadFailed'))
    } finally {
      setCoverUploading(false)
      setPending(false)
    }
  }

  const handleRemoveCover = async (): Promise<void> => {
    if (!values.coverPath) return
    setPending(true)
    setError('')
    setNotice('')
    try {
      const oldPath = values.coverPath
      const result = await saveTripDraft({ ...payload(), coverPath: null })
      if (!result.success) throw new Error('Could not clear cover')
      await createClient().storage.from('trip-covers').remove([oldPath])
      patchValues({ coverPath: null })
      setCoverUrl(null)
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current)
        coverPreviewUrlRef.current = null
      }
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setPending(false)
    }
  }

  const openActivity = (activity?: TripActivity, date?: string): void => {
    setActivityValues(
      activity ? { ...activity } : createInitialTripActivity(date ?? dates[0] ?? ''),
    )
    setActivityOpen(true)
  }

  const handleActivitySubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!draftId) return
    setPending(true)
    try {
      const result = await saveTripActivity({
        ...activityValues,
        tripId: draftId,
        activityId: activityValues.id,
      })
      if (!result.success) {
        setError(t('create.errors.activitySaveFailed'))
        return
      }
      setActivities((current) => {
        const exists = current.some((activity) => activity.id === result.data.id)
        const nextActivities = exists
          ? current.map((activity) => (activity.id === result.data.id ? result.data : activity))
          : [...current, result.data]
        return sortTripActivities(nextActivities)
      })
      setActivityOpen(false)
      setError('')
    } catch {
      setError(t('create.errors.activitySaveFailed'))
    } finally {
      setPending(false)
    }
  }

  const handleDeleteActivity = async (activityId: string): Promise<void> => {
    if (!draftId) return
    try {
      const result = await deleteTripActivity({ tripId: draftId, activityId })
      if (!result.success) {
        setError(t('create.errors.activitySaveFailed'))
        return
      }
      setActivities((current) => current.filter((activity) => activity.id !== activityId))
      setError('')
    } catch {
      setError(t('create.errors.activitySaveFailed'))
    }
  }

  const updateActivity = async (
    activity: TripActivity,
    patch: Partial<TripActivityFormValues>,
  ): Promise<void> => {
    if (!draftId) return
    try {
      const result = await saveTripActivity({
        ...activity,
        ...patch,
        tripId: draftId,
        activityId: activity.id,
      })
      if (!result.success) {
        setError(t('create.errors.activitySaveFailed'))
        return
      }
      setActivities((current) =>
        sortTripActivities(current.map((item) => (item.id === activity.id ? result.data : item))),
      )
      setError('')
    } catch {
      setError(t('create.errors.activitySaveFailed'))
    }
  }

  const moveActivity = (activity: TripActivity, targetDate: string): void => {
    if (targetDate !== activity.activityDate)
      void updateActivity(activity, { activityDate: targetDate })
  }

  const handleSaveNote = async (): Promise<void> => {
    if (!draftId) {
      await handleSaveDraft()
      return
    }
    setPending(true)
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
      setPending(false)
    }
  }

  const handlePublish = async (): Promise<void> => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }
    setPending(true)
    setError('')
    try {
      const saved = await saveTripDraft(payload())
      if (!saved.success) {
        setError(t('errors.saveFailed'))
        return
      }
      setDraftId(saved.data.id)
      const result = await publishTrip({ tripId: saved.data.id })
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
      setPending(false)
    }
  }

  return {
    data: {
      activityOpen,
      activityValues,
      activities,
      coverUrl,
      dates,
      draftId,
      step,
      values,
    },
    handlers: {
      handleActivitySubmit,
      handleCancel,
      handleContinue,
      handleCover,
      handleDeleteActivity,
      handlePublish,
      handleRemoveCover,
      handleSaveDraft,
      handleSaveNote,
      moveActivity,
      openActivity,
      patchActivityValues,
      patchValues,
      setActivityOpen,
      setStep,
      updateActivity,
    },
    statuses: {
      error,
      notice,
      pending,
      coverUploading,
    },
  }
}
