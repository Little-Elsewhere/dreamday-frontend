'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { FormEvent, ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ACTIVITY_TIME_OPTIONS, ACTIVITY_TYPES } from '@/features/trips/constants/trips'
import type { TripActivityFormValues } from '@/features/trips/types/components'
import { formatMinute, formatTripActivityDate } from '@/features/trips/utils/trip'

type Props = {
  dates: string[]
  onChange: (patch: Partial<TripActivityFormValues>) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  open: boolean
  pending: boolean
  values: TripActivityFormValues
}

export const TripActivityDialog = ({
  dates,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  pending,
  values,
}: Props): ReactElement => {
  const t = useTranslations('trips')
  const locale = useLocale()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-line bg-surface text-ink w-[min(calc(100%-2rem),600px)] max-w-none gap-0 rounded-2xl border p-0 shadow-2xl ring-0"
        overlayClassName="bg-overlay"
      >
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-left">
            <DialogTitle className="text-primary text-2xl font-medium">
              {values.id ? t('create.activity.editTitle') : t('create.activity.addTitle')}
            </DialogTitle>
            <DialogDescription className="text-ink-soft">
              {t('create.activity.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <form className="mt-6 grid gap-4" onSubmit={(event) => void onSubmit(event)}>
            <label className="grid gap-2" htmlFor="activity-title">
              <span className="text-sm font-medium">{t('create.activity.fields.title')}</span>
              <input
                required
                id="activity-title"
                maxLength={80}
                onChange={(event) => onChange({ title: event.target.value })}
                value={values.title}
                className="border-line-strong bg-field focus-visible:border-primary rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2" htmlFor="activity-date">
                <span className="text-sm font-medium">{t('create.activity.fields.date')}</span>
                <select
                  required
                  id="activity-date"
                  onChange={(event) => onChange({ activityDate: event.target.value })}
                  value={values.activityDate}
                  className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                >
                  {dates.map((date) => (
                    <option key={date} value={date}>
                      {formatTripActivityDate(date, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2" htmlFor="activity-type">
                <span className="text-sm font-medium">{t('create.activity.fields.type')}</span>
                <select
                  id="activity-type"
                  onChange={(event) =>
                    onChange({
                      activityType: event.target.value as (typeof ACTIVITY_TYPES)[number],
                    })
                  }
                  value={values.activityType}
                  className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`create.activityTypes.${type}`)}
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
                  onChange={(event) => {
                    const startMinute = Number(event.target.value)
                    onChange({
                      startMinute,
                      endMinute: Math.max(values.endMinute, startMinute + 15),
                    })
                  }}
                  value={values.startMinute}
                  className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                >
                  {ACTIVITY_TIME_OPTIONS.slice(0, -1).map((minute) => (
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
                  onChange={(event) => onChange({ endMinute: Number(event.target.value) })}
                  value={values.endMinute}
                  className="border-line-strong bg-field rounded-auth focus-visible:ring-primary/20 min-h-11 border px-3 text-base outline-none focus-visible:ring-3"
                >
                  {ACTIVITY_TIME_OPTIONS.filter((minute) => minute > values.startMinute).map(
                    (minute) => (
                      <option key={minute} value={minute}>
                        {formatMinute(minute)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <label className="grid gap-2" htmlFor="activity-note">
              <span className="text-sm font-medium">{t('create.activity.fields.note')}</span>
              <textarea
                id="activity-note"
                maxLength={500}
                onChange={(event) => onChange({ note: event.target.value })}
                rows={3}
                value={values.note}
                className="border-line-strong bg-field focus-visible:border-primary rounded-auth focus-visible:ring-primary/20 border px-3 py-3 text-base outline-none focus-visible:ring-3"
              />
            </label>
            <DialogFooter className="mt-2">
              <Button
                disabled={pending}
                onClick={() => onOpenChange(false)}
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
  )
}
