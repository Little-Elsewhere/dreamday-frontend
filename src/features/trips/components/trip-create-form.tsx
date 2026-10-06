'use client'

import Image from 'next/image'
import { useMemo, useState, type FormEvent, type ReactElement } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeedbackMessage } from '@/components/common/feedback-message'
import {
  ACTIVITY_TYPES,
  TRIP_PACES,
  type ActivityType,
  type TripActivity,
  type TripDraft,
  type TripPace,
} from '@/features/trips/types/trip'
import {
  deleteTripActivity,
  publishTrip,
  saveTripActivity,
  saveTripDraft,
  saveTripNote,
} from '@/features/trips/actions/trips'
import { formatMinute } from '@/features/trips/utils/trip'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

type DraftValues = Pick<
  TripDraft,
  'name' | 'destination' | 'description' | 'startDate' | 'endDate' | 'pace' | 'coverPath' | 'note'
>
type ActivityValues = Omit<TripActivity, 'id'> & { id?: string }

const initialActivity = (date: string): ActivityValues => ({
  title: '',
  activityDate: date,
  activityType: 'explore',
  startMinute: 9 * 60,
  endMinute: 10 * 60,
  note: '',
})

const datesInRange = (start: string, end: string): string[] => {
  if (!start || !end || end < start) return []
  const dates: string[] = []
  const cursor = new Date(`${start}T12:00:00Z`)
  const endTime = new Date(`${end}T12:00:00Z`).getTime()
  while (cursor.getTime() <= endTime && dates.length < 60) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

const dateLabel = (value: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(`${value}T12:00:00+07:00`),
  )

export const TripCreateForm = ({
  initialDraft,
}: {
  initialDraft: TripDraft | null
}): ReactElement => {
  const t = useTranslations('trips')
  const locale = useLocale()
  const router = useRouter()
  const [values, setValues] = useState<DraftValues>({
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
  const [activities, setActivities] = useState<TripActivity[]>(initialDraft?.activities ?? [])
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityValues, setActivityValues] = useState<ActivityValues>(initialActivity(''))
  const dates = useMemo(
    () => datesInRange(values.startDate, values.endDate),
    [values.endDate, values.startDate],
  )

  const patchValues = (patch: Partial<DraftValues>): void =>
    setValues((current) => ({ ...current, ...patch }))
  const payload = () => ({ ...values })

  const persistDraft = async (): Promise<string | null> => {
    setError('')
    const result = await saveTripDraft(payload())
    if (!result.success) {
      setError(t('errors.saveFailed'))
      return null
    }
    setDraftId(result.data.id)
    setNotice(t('create.draftSaved'))
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

  const handleContinue = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
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
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError(t('create.errors.invalidCover'))
      return
    }
    setPending(true)
    setError('')
    try {
      const id = draftId ?? (await persistDraft())
      if (!id) return
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Missing user')
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.slice('image/'.length)
      const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`
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
      if (previousPath) await supabase.storage.from('trip-covers').remove([previousPath])
      const { data: signed } = await supabase.storage
        .from('trip-covers')
        .createSignedUrl(path, 3600)
      patchValues({ coverPath: path })
      setCoverUrl(signed?.signedUrl ?? URL.createObjectURL(file))
      setDraftId(result.data.id)
      setNotice(t('create.coverUploaded'))
    } catch {
      setError(t('create.errors.invalidCover'))
    } finally {
      setPending(false)
    }
  }

  const handleRemoveCover = async (): Promise<void> => {
    if (!values.coverPath) return
    setPending(true)
    try {
      const oldPath = values.coverPath
      const result = await saveTripDraft({ ...payload(), coverPath: null })
      if (!result.success) throw new Error('Could not clear cover')
      await createClient().storage.from('trip-covers').remove([oldPath])
      patchValues({ coverPath: null })
      setCoverUrl(null)
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setPending(false)
    }
  }

  const openActivity = (activity?: TripActivity, date?: string): void => {
    setActivityValues(activity ? { ...activity } : initialActivity(date ?? dates[0] ?? ''))
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
        return exists
          ? current.map((activity) => (activity.id === result.data.id ? result.data : activity))
          : [...current, result.data].sort(
              (a, b) =>
                a.activityDate.localeCompare(b.activityDate) || a.startMinute - b.startMinute,
            )
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
    const result = await deleteTripActivity({ tripId: draftId, activityId })
    if (!result.success) {
      setError(t('create.errors.activitySaveFailed'))
      return
    }
    setActivities((current) => current.filter((activity) => activity.id !== activityId))
  }

  const updateActivity = async (
    activity: TripActivity,
    patch: Partial<ActivityValues>,
  ): Promise<void> => {
    if (!draftId) return
    const result = await saveTripActivity({
      ...activity,
      ...patch,
      tripId: draftId,
      activityId: activity.id,
    })
    if (result.success) {
      setActivities((current) =>
        current.map((item) => (item.id === activity.id ? result.data : item)),
      )
    } else {
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
    const result = await saveTripNote({ tripId: draftId, note: values.note })
    setPending(false)
    setNotice(result.success ? t('create.noteSaved') : '')
    if (!result.success) setError(t('errors.saveFailed'))
  }

  const handlePublish = async (): Promise<void> => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      setError(t('create.errors.endBeforeStart'))
      return
    }
    setPending(true)
    setError('')
    try {
      const id = draftId ?? (await persistDraft())
      if (!id) return
      const saved = await saveTripDraft(payload())
      if (!saved.success) {
        setError(t('errors.saveFailed'))
        return
      }
      const result = await publishTrip({ tripId: id })
      if (!result.success) {
        const field = result.error.kind === 'field' ? result.error.field : ''
        const key =
          field === 'name'
            ? 'nameRequired'
            : field === 'startDate'
              ? 'startDateRequired'
              : field === 'endDate'
                ? 'endDateRequired'
                : field === 'pace'
                  ? 'paceRequired'
                  : field === 'endDate'
                    ? 'endBeforeStart'
                    : 'publishRequired'
        setError(t(`create.errors.${key}`))
        return
      }
      router.push(`/trips/${result.data.id}`)
      router.refresh()
    } catch {
      setError(t('errors.saveFailed'))
    } finally {
      setPending(false)
    }
  }

  const timeOptions = Array.from({ length: 97 }, (_, index) => index * 15)
  const activityTypeLabel = (type: ActivityType): string => t(`create.activityTypes.${type}`)

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10 md:py-12">
      <div className="border-line flex flex-col justify-between gap-5 border-b pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-champagne-ink text-xs font-semibold tracking-[0.18em] uppercase">
            {t('create.eyebrow')}
          </p>
          <h1 className="text-primary mt-2 text-3xl font-medium tracking-[-0.05em] md:text-4xl">
            {step === 1 ? t('create.title') : t('create.scheduleTitle')}
          </h1>
          <p className="text-ink-soft mt-2">
            {step === 1 ? t('create.intro') : t('create.scheduleIntro')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => void handleSaveDraft()}
            type="button"
            variant="outline"
          >
            {t('create.actions.saveDraft')}
          </Button>
          {step === 2 && (
            <Button
              disabled={pending}
              loading={pending}
              onClick={() => void handlePublish()}
              type="button"
            >
              {t('create.actions.publish')}
            </Button>
          )}
        </div>
      </div>

      <div aria-label={t('create.steps.label')} className="my-7 grid grid-cols-2 gap-2" role="list">
        {[1, 2].map((item) => (
          <div
            key={item}
            aria-current={step === item ? 'step' : undefined}
            className={`rounded-auth px-4 py-3 text-sm font-medium ${step === item ? 'bg-primary text-white' : 'bg-surface text-ink-soft'}`}
            role="listitem"
          >
            <span className="mr-2">{String(item).padStart(2, '0')}</span>
            {t(`create.steps.step${item}`)}
          </div>
        ))}
      </div>

      {error && <FeedbackMessage isError message={error} />}
      {notice && <FeedbackMessage isError={false} message={notice} />}

      {step === 1 ? (
        <form className="grid gap-6" onSubmit={(event) => void handleContinue(event)}>
          <section className="border-line bg-surface grid gap-6 rounded-2xl border p-5 sm:p-8">
            <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-5">
                <label className="grid gap-2" htmlFor="trip-name">
                  <span className="text-ink text-sm font-medium">
                    {t('create.fields.name')}{' '}
                    <span aria-hidden="true" className="text-error-text">
                      *
                    </span>
                  </span>
                  <input
                    id="trip-name"
                    maxLength={40}
                    onChange={(event) => patchValues({ name: event.target.value })}
                    placeholder={t('create.placeholders.name')}
                    value={values.name}
                    className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-3 text-base outline-none focus-visible:ring-3"
                  />
                  <span className="text-ink-soft text-right text-xs">{values.name.length}/40</span>
                </label>
                <label className="grid gap-2" htmlFor="trip-destination">
                  <span className="text-ink text-sm font-medium">
                    {t('create.fields.destination')}
                  </span>
                  <input
                    id="trip-destination"
                    maxLength={40}
                    onChange={(event) => patchValues({ destination: event.target.value })}
                    placeholder={t('create.placeholders.destination')}
                    value={values.destination}
                    className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-3 text-base outline-none focus-visible:ring-3"
                  />
                </label>
                <label className="grid gap-2" htmlFor="trip-description">
                  <span className="text-ink text-sm font-medium">
                    {t('create.fields.description')}
                  </span>
                  <textarea
                    id="trip-description"
                    maxLength={100}
                    onChange={(event) => patchValues({ description: event.target.value })}
                    placeholder={t('create.placeholders.description')}
                    rows={3}
                    value={values.description}
                    className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth w-full resize-y border px-3 py-3 text-base outline-none focus-visible:ring-3"
                  />
                  <span className="text-ink-soft text-right text-xs">
                    {values.description.length}/100
                  </span>
                </label>
              </div>
              <div className="grid content-start gap-3">
                <span className="text-ink text-sm font-medium">{t('create.fields.cover')}</span>
                <div className="bg-paper border-line relative aspect-video overflow-hidden rounded-xl border">
                  {coverUrl ? (
                    <Image
                      alt={t('create.coverAlt')}
                      className="object-cover"
                      fill
                      sizes="(min-width: 768px) 35vw, 100vw"
                      src={coverUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="text-ink-soft grid h-full place-items-center px-6 text-center text-sm">
                      {t('create.coverEmpty')}
                    </div>
                  )}
                </div>
                <label className="focus-within:ring-focus rounded-auth border-line-strong text-primary hover:bg-paper inline-flex min-h-11 cursor-pointer items-center justify-center border px-4 text-sm font-medium focus-within:ring-2">
                  {t('create.actions.chooseCover')}
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={pending}
                    onChange={(event) => {
                      void handleCover(event.target.files?.[0])
                      event.currentTarget.value = ''
                    }}
                    type="file"
                  />
                </label>
                {values.coverPath && (
                  <Button
                    disabled={pending}
                    onClick={() => void handleRemoveCover()}
                    type="button"
                    variant="ghost"
                  >
                    {t('create.actions.removeCover')}
                  </Button>
                )}
                <p className="text-ink-soft text-xs">{t('create.coverHelp')}</p>
              </div>
            </div>
            <div className="border-line grid gap-5 border-t pt-6 md:grid-cols-2">
              <label className="grid gap-2" htmlFor="trip-start-date">
                <span className="text-ink text-sm font-medium">{t('create.fields.startDate')}</span>
                <input
                  id="trip-start-date"
                  max={values.endDate || undefined}
                  onChange={(event) => patchValues({ startDate: event.target.value })}
                  type="date"
                  value={values.startDate}
                  className="border-line-strong bg-field text-ink focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-3 text-base outline-none focus-visible:ring-3"
                />
              </label>
              <label className="grid gap-2" htmlFor="trip-end-date">
                <span className="text-ink text-sm font-medium">{t('create.fields.endDate')}</span>
                <input
                  id="trip-end-date"
                  min={values.startDate || undefined}
                  onChange={(event) => patchValues({ endDate: event.target.value })}
                  type="date"
                  value={values.endDate}
                  className="border-line-strong bg-field text-ink focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-3 text-base outline-none focus-visible:ring-3"
                />
              </label>
            </div>
            <fieldset className="border-line grid gap-3 border-t pt-6">
              <legend className="text-ink text-sm font-medium">{t('create.fields.pace')}</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {TRIP_PACES.map((pace) => (
                  <label
                    key={pace}
                    className={`rounded-auth flex min-h-12 cursor-pointer items-center gap-3 border px-4 transition ${values.pace === pace ? 'border-primary bg-paper text-primary' : 'border-line-strong bg-surface text-ink-soft'}`}
                  >
                    <input
                      checked={values.pace === pace}
                      className="accent-primary size-4"
                      name="trip-pace"
                      onChange={() => patchValues({ pace: pace as TripPace })}
                      type="radio"
                      value={pace}
                    />
                    <span className="text-sm font-medium">{t(`create.paces.${pace}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <Button onClick={() => router.push('/trips')} type="button" variant="ghost">
              {t('create.actions.cancel')}
            </Button>
            <Button disabled={pending} loading={pending} type="submit">
              {t('create.actions.continue')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6">
          <section className="border-line bg-surface rounded-2xl border p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-primary text-2xl font-medium tracking-tight">
                  {t('create.itinerary.heading')}
                </h2>
                <p className="text-ink-soft mt-2 max-w-2xl text-sm leading-relaxed">
                  {t('create.itinerary.description')}
                </p>
              </div>
              <Button
                disabled={!draftId || dates.length === 0}
                onClick={() => openActivity()}
                type="button"
              >
                <span aria-hidden="true" className="text-lg">
                  ＋
                </span>
                {t('create.actions.addActivity')}
              </Button>
            </div>
            {dates.length === 0 ? (
              <p className="border-line bg-paper text-ink-soft mt-6 rounded-xl border p-5 text-sm">
                {t('create.itinerary.addDatesFirst')}
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {dates.map((date) => {
                  const dayActivities = activities.filter(
                    (activity) => activity.activityDate === date,
                  )
                  return (
                    <section
                      key={date}
                      aria-label={dateLabel(date, locale)}
                      className="border-line rounded-xl border p-4 transition-colors"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        const id = event.dataTransfer.getData('text/plain')
                        const activity = activities.find((item) => item.id === id)
                        if (activity) moveActivity(activity, date)
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-primary font-semibold">{dateLabel(date, locale)}</h3>
                        <Button
                          onClick={() => openActivity(undefined, date)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {t('create.actions.addForDay')}
                        </Button>
                      </div>
                      {dayActivities.length === 0 ? (
                        <p className="text-ink-soft bg-paper mt-3 rounded-lg px-3 py-4 text-sm">
                          {t('create.itinerary.emptyDay')}
                        </p>
                      ) : (
                        <ul className="mt-3 grid gap-3">
                          {dayActivities.map((activity) => (
                            <li key={activity.id}>
                              <article
                                draggable
                                onDragStart={(event) =>
                                  event.dataTransfer.setData('text/plain', activity.id)
                                }
                                className="border-line bg-paper rounded-xl border p-4"
                              >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                  <button
                                    className="min-w-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                                    onClick={() => openActivity(activity)}
                                    type="button"
                                  >
                                    <span className="text-champagne-ink text-xs font-semibold uppercase">
                                      {activityTypeLabel(activity.activityType)}
                                    </span>
                                    <span className="text-primary mt-1 block font-semibold">
                                      {activity.title}
                                    </span>
                                    <span className="text-ink-soft mt-1 block text-sm">
                                      {formatMinute(activity.startMinute)} –{' '}
                                      {formatMinute(activity.endMinute)}
                                    </span>
                                    {activity.note && (
                                      <span className="text-ink-soft mt-2 block text-sm">
                                        {activity.note}
                                      </span>
                                    )}
                                  </button>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                      aria-label={t('create.actions.moveDayEarlier', {
                                        title: activity.title,
                                      })}
                                      disabled={dates.indexOf(date) <= 0}
                                      onClick={() =>
                                        moveActivity(
                                          activity,
                                          dates[dates.indexOf(date) - 1] ?? date,
                                        )
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      ← {t('create.actions.previousDay')}
                                    </Button>
                                    <Button
                                      aria-label={t('create.actions.moveDayLater', {
                                        title: activity.title,
                                      })}
                                      disabled={dates.indexOf(date) >= dates.length - 1}
                                      onClick={() =>
                                        moveActivity(
                                          activity,
                                          dates[dates.indexOf(date) + 1] ?? date,
                                        )
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      {t('create.actions.nextDay')} →
                                    </Button>
                                    <Button
                                      aria-label={t('create.actions.shiftEarlier', {
                                        title: activity.title,
                                      })}
                                      disabled={activity.startMinute < 15}
                                      onClick={() =>
                                        void updateActivity(activity, {
                                          startMinute: activity.startMinute - 15,
                                          endMinute: activity.endMinute - 15,
                                        })
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      −15
                                    </Button>
                                    <Button
                                      aria-label={t('create.actions.shiftLater', {
                                        title: activity.title,
                                      })}
                                      disabled={activity.endMinute > 1425}
                                      onClick={() =>
                                        void updateActivity(activity, {
                                          startMinute: activity.startMinute + 15,
                                          endMinute: activity.endMinute + 15,
                                        })
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      +15
                                    </Button>
                                    <Button
                                      aria-label={t('create.actions.shorten', {
                                        title: activity.title,
                                      })}
                                      disabled={activity.endMinute - activity.startMinute <= 15}
                                      onClick={() =>
                                        void updateActivity(activity, {
                                          endMinute: activity.endMinute - 15,
                                        })
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      {t('create.actions.shorter')}
                                    </Button>
                                    <Button
                                      aria-label={t('create.actions.extend', {
                                        title: activity.title,
                                      })}
                                      disabled={activity.endMinute >= 1440}
                                      onClick={() =>
                                        void updateActivity(activity, {
                                          endMinute: activity.endMinute + 15,
                                        })
                                      }
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                    >
                                      {t('create.actions.longer')}
                                    </Button>
                                    <Button
                                      onClick={() => void handleDeleteActivity(activity.id)}
                                      size="sm"
                                      type="button"
                                      variant="ghost"
                                    >
                                      {t('create.actions.delete')}
                                    </Button>
                                  </div>
                                </div>
                              </article>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )
                })}
              </div>
            )}
          </section>

          <section className="border-line bg-surface rounded-2xl border p-5 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-primary text-xl font-medium">{t('create.note.heading')}</h2>
                <p className="text-ink-soft mt-1 text-sm">{t('create.note.description')}</p>
              </div>
              <Button
                disabled={pending}
                onClick={() => void handleSaveNote()}
                type="button"
                variant="outline"
              >
                {t('create.actions.saveNote')}
              </Button>
            </div>
            <label className="sr-only" htmlFor="trip-note">
              {t('create.note.label')}
            </label>
            <textarea
              id="trip-note"
              className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth mt-5 min-h-36 w-full resize-y border px-3 py-3 text-base outline-none focus-visible:ring-3"
              maxLength={1000}
              onChange={(event) => patchValues({ note: event.target.value })}
              placeholder={t('create.note.placeholder')}
              value={values.note}
            />
            <p className="text-ink-soft mt-2 text-right text-xs">{values.note.length}/1000</p>
          </section>

          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <Button disabled={pending} onClick={() => setStep(1)} type="button" variant="outline">
              {t('create.actions.back')}
            </Button>
            <Button
              disabled={pending}
              loading={pending}
              onClick={() => void handlePublish()}
              type="button"
            >
              {t('create.actions.publish')}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent
          className="border-line bg-surface text-ink w-[min(calc(100%-2rem),600px)] max-w-none gap-0 rounded-2xl border p-0 shadow-2xl ring-0"
          overlayClassName="bg-overlay"
        >
          <div className="p-6 sm:p-8">
            <DialogHeader className="text-left">
              <DialogTitle className="text-primary text-2xl font-medium">
                {activityValues.id ? t('create.activity.editTitle') : t('create.activity.addTitle')}
              </DialogTitle>
              <DialogDescription className="text-ink-soft">
                {t('create.activity.dialogDescription')}
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => void handleActivitySubmit(event)}
            >
              <label className="grid gap-2" htmlFor="activity-title">
                <span className="text-sm font-medium">{t('create.activity.fields.title')}</span>
                <input
                  required
                  id="activity-title"
                  maxLength={80}
                  onChange={(event) =>
                    setActivityValues((current) => ({ ...current, title: event.target.value }))
                  }
                  value={activityValues.title}
                  className="border-line-strong bg-field focus-visible:border-primary rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2" htmlFor="activity-date">
                  <span className="text-sm font-medium">{t('create.activity.fields.date')}</span>
                  <select
                    required
                    id="activity-date"
                    onChange={(event) =>
                      setActivityValues((current) => ({
                        ...current,
                        activityDate: event.target.value,
                      }))
                    }
                    value={activityValues.activityDate}
                    className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                  >
                    {dates.map((date) => (
                      <option key={date} value={date}>
                        {dateLabel(date, locale)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2" htmlFor="activity-type">
                  <span className="text-sm font-medium">{t('create.activity.fields.type')}</span>
                  <select
                    id="activity-type"
                    onChange={(event) =>
                      setActivityValues((current) => ({
                        ...current,
                        activityType: event.target.value as ActivityType,
                      }))
                    }
                    value={activityValues.activityType}
                    className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {activityTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2" htmlFor="activity-start">
                  <span className="text-sm font-medium">{t('create.activity.fields.start')}</span>
                  <select
                    id="activity-start"
                    onChange={(event) =>
                      setActivityValues((current) => ({
                        ...current,
                        startMinute: Number(event.target.value),
                        endMinute: Math.max(current.endMinute, Number(event.target.value) + 15),
                      }))
                    }
                    value={activityValues.startMinute}
                    className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                  >
                    {timeOptions.slice(0, -1).map((minute) => (
                      <option key={minute} value={minute}>
                        {formatMinute(minute)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2" htmlFor="activity-end">
                  <span className="text-sm font-medium">{t('create.activity.fields.end')}</span>
                  <select
                    id="activity-end"
                    onChange={(event) =>
                      setActivityValues((current) => ({
                        ...current,
                        endMinute: Number(event.target.value),
                      }))
                    }
                    value={activityValues.endMinute}
                    className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                  >
                    {timeOptions
                      .filter((minute) => minute > activityValues.startMinute)
                      .map((minute) => (
                        <option key={minute} value={minute}>
                          {formatMinute(minute)}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2" htmlFor="activity-note">
                <span className="text-sm font-medium">{t('create.activity.fields.note')}</span>
                <textarea
                  id="activity-note"
                  maxLength={500}
                  onChange={(event) =>
                    setActivityValues((current) => ({ ...current, note: event.target.value }))
                  }
                  rows={3}
                  value={activityValues.note}
                  className="border-line-strong bg-field focus-visible:border-primary rounded-auth focus-visible:ring-primary/20 border px-3 py-3 text-base outline-none focus-visible:ring-3"
                />
              </label>
              <DialogFooter className="mt-2">
                <Button
                  disabled={pending}
                  onClick={() => setActivityOpen(false)}
                  type="button"
                  variant="outline"
                >
                  {t('create.actions.cancel')}
                </Button>
                <Button disabled={pending} loading={pending} type="submit">
                  {t('create.actions.saveActivity')}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
