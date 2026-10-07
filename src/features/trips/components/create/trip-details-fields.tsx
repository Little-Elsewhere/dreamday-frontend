'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactElement } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Image01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { TRIP_PACES } from '@/features/trips/constants/trips'
import type { TripDraftFormValues } from '@/features/trips/types/components'
import type { TripPace } from '@/features/trips/types/trip'
import { getTripDuration } from '@/features/trips/utils/trip'
import { cn } from '@/utils/cn'

type Props = {
  coverUrl: string | null
  onChange: (patch: Partial<TripDraftFormValues>) => void
  onChooseCover: (file: File | undefined) => Promise<void>
  onRemoveCover: () => Promise<void>
  coverUploading: boolean
  pending: boolean
  values: TripDraftFormValues
}

export const TripDetailsFields = ({
  coverUrl,
  onChange,
  onChooseCover,
  onRemoveCover,
  coverUploading,
  pending,
  values,
}: Props): ReactElement => {
  const t = useTranslations('trips')
  const duration =
    values.startDate && values.endDate && values.endDate >= values.startDate
      ? getTripDuration(values.startDate, values.endDate)
      : null

  return (
    <section className="grid gap-4">
      <article className="border-line bg-surface grid overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="bg-paper min-w-0">
          <div className="bg-muted relative grid aspect-4/3 min-h-56 place-items-center overflow-hidden md:min-h-64">
            {coverUrl ? (
              <Image
                alt={t('create.coverAlt')}
                className="object-cover"
                fill
                sizes="(min-width: 1280px) 486px, (min-width: 768px) 40vw, 100vw"
                src={coverUrl}
                unoptimized
              />
            ) : (
              <div className="text-ink-soft flex flex-col items-center gap-4 px-6 text-center">
                <span className="text-champagne-ink bg-surface/70 grid size-16 place-items-center rounded-full">
                  <HugeiconsIcon icon={Image01Icon} size={28} strokeWidth={1.5} />
                </span>
                <span className="max-w-48 text-sm leading-6">{t('create.coverEmpty')}</span>
              </div>
            )}
          </div>
          <div className="border-line bg-paper grid justify-items-center gap-2 border-t px-4 py-4">
            <div className="flex flex-wrap justify-center gap-2">
              <label className="focus-within:ring-focus rounded-auth border-line-strong bg-surface text-primary hover:bg-muted inline-flex min-h-11 cursor-pointer items-center justify-center border px-4 text-sm font-medium transition-colors focus-within:ring-2">
                {t(coverUrl ? 'create.actions.replaceCover' : 'create.actions.chooseCover')}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby="trip-cover-help"
                  className="sr-only"
                  disabled={pending}
                  onChange={(event) => {
                    void onChooseCover(event.target.files?.[0])
                    event.currentTarget.value = ''
                  }}
                  type="file"
                />
              </label>
              {values.coverPath && (
                <Button
                  disabled={pending}
                  onClick={() => void onRemoveCover()}
                  type="button"
                  variant="ghost"
                >
                  {t('create.actions.removeCover')}
                </Button>
              )}
            </div>
            <p className="text-ink-soft text-center text-xs" id="trip-cover-help">
              {t('create.coverHelp')}
            </p>
            {coverUploading && (
              <p aria-live="polite" className="text-primary text-xs font-medium" role="status">
                {t('create.coverUploading')}
              </p>
            )}
          </div>
        </div>

        <div className="grid content-center gap-5 p-5 md:p-6 lg:p-8">
          <label className="grid gap-2" htmlFor="trip-destination">
            <span className="text-ink-soft text-xs font-medium">
              {t('create.fields.destination')}
            </span>
            <input
              id="trip-destination"
              maxLength={40}
              onChange={(event) => onChange({ destination: event.target.value })}
              placeholder={t('create.placeholders.destination')}
              value={values.destination}
              className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-2.5 text-base outline-none focus-visible:ring-3"
            />
          </label>

          <label className="grid gap-2" htmlFor="trip-name">
            <span className="text-primary text-sm font-medium">
              {t('create.fields.name')}{' '}
              <span aria-hidden="true" className="text-error-text">
                *
              </span>
            </span>
            <input
              id="trip-name"
              maxLength={40}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder={t('create.placeholders.name')}
              value={values.name}
              className="border-line-strong bg-field text-primary placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full border px-3 py-2.5 text-lg font-medium tracking-[-0.03em] outline-none focus-visible:ring-3 sm:text-xl"
            />
            <span className="text-ink-soft text-right text-xs">{values.name.length}/40</span>
          </label>

          <label className="grid gap-2" htmlFor="trip-description">
            <span className="text-primary text-sm font-medium">
              {t('create.fields.description')}
            </span>
            <textarea
              id="trip-description"
              maxLength={100}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder={t('create.placeholders.description')}
              rows={2}
              value={values.description}
              className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth w-full resize-y border px-3 py-3 text-base leading-6 outline-none focus-visible:ring-3"
            />
            <span className="text-ink-soft text-right text-xs">
              {values.description.length}/100
            </span>
          </label>

          <span className="bg-paper text-champagne-ink inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
            <span aria-hidden="true" className="bg-champagne size-1.5 rounded-full" />
            {t('create.draftStatus')}
          </span>
        </div>
      </article>

      <div className="border-line bg-surface grid overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,1.1fr)]">
        <section className="grid content-start gap-3 p-5 md:p-6">
          <h2 className="text-ink text-sm font-medium">{t('create.fields.dateRange')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-2" htmlFor="trip-start-date">
              <span className="text-ink-soft text-xs">{t('create.fields.startDate')}</span>
              <input
                id="trip-start-date"
                max={values.endDate || undefined}
                onChange={(event) => onChange({ startDate: event.target.value })}
                type="date"
                value={values.startDate}
                className="border-line-strong bg-field text-ink focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full min-w-0 border px-2.5 text-sm outline-none focus-visible:ring-3 sm:px-3"
              />
            </label>
            <label className="grid min-w-0 gap-2" htmlFor="trip-end-date">
              <span className="text-ink-soft text-xs">{t('create.fields.endDate')}</span>
              <input
                id="trip-end-date"
                min={values.startDate || undefined}
                onChange={(event) => onChange({ endDate: event.target.value })}
                type="date"
                value={values.endDate}
                className="border-line-strong bg-field text-ink focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-12 w-full min-w-0 border px-2.5 text-sm outline-none focus-visible:ring-3 sm:px-3"
              />
            </label>
          </div>
        </section>

        <section className="border-line grid content-center gap-2 border-t px-5 py-4 md:border-t-0 md:border-l md:px-6">
          <h2 className="text-ink-soft text-xs font-medium">{t('create.fields.duration')}</h2>
          <p className="text-primary text-lg font-medium">
            {duration === null
              ? t('create.duration.notSet')
              : t('create.duration.days', { count: duration })}
          </p>
          <p className="text-ink-soft text-xs">{t('create.duration.caption')}</p>
        </section>

        <fieldset className="border-line grid content-start gap-3 border-t p-5 md:border-t-0 md:border-l md:p-6">
          <legend className="sr-only">{t('create.fields.pace')}</legend>
          <span aria-hidden="true" className="text-ink text-sm font-medium">
            {t('create.fields.pace')}
          </span>
          <div className="flex flex-wrap gap-2">
            {TRIP_PACES.map((pace) => (
              <label
                key={pace}
                className={cn(
                  'rounded-auth flex min-h-11 cursor-pointer items-center border px-3 transition-colors',
                  values.pace === pace
                    ? 'border-primary bg-paper text-primary'
                    : 'border-line-strong bg-surface text-ink-soft hover:bg-paper',
                )}
              >
                <input
                  checked={values.pace === pace}
                  className="peer sr-only"
                  name="trip-pace"
                  onChange={() => onChange({ pace: pace as TripPace })}
                  type="radio"
                  value={pace}
                />
                <span className="peer-focus-visible:outline-focus rounded-auth px-1 text-xs font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 sm:text-sm">
                  {t(`create.paces.${pace}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}
