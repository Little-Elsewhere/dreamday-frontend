'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import type { TripActivityFormValues } from '@/features/trips/types/components'
import type { TripActivity } from '@/features/trips/types/trip'
import {
  formatMinute,
  formatTripActivityDate,
  groupTripActivitiesByDate,
} from '@/features/trips/utils/trip'

type Props = {
  activities: TripActivity[]
  canAddActivity: boolean
  dates: string[]
  pending: boolean
  onDeleteActivity: (activityId: string) => Promise<void>
  onMoveActivity: (activity: TripActivity, targetDate: string) => void
  onOpenActivity: (activity?: TripActivity, date?: string) => void
  onUpdateActivity: (
    activity: TripActivity,
    patch: Partial<TripActivityFormValues>,
  ) => Promise<void>
}

export const TripItinerarySection = ({
  activities,
  canAddActivity,
  dates,
  pending,
  onDeleteActivity,
  onMoveActivity,
  onOpenActivity,
  onUpdateActivity,
}: Props): ReactElement => {
  const t = useTranslations('trips')
  const locale = useLocale()
  const activitiesByDate = groupTripActivitiesByDate(activities)

  return (
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
          disabled={pending || !canAddActivity || dates.length === 0}
          onClick={() => onOpenActivity()}
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
            const dayActivities = activitiesByDate.get(date) ?? []
            return (
              <section
                key={date}
                aria-label={formatTripActivityDate(date, locale)}
                className="border-line rounded-xl border p-4 transition-colors"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const id = event.dataTransfer.getData('text/plain')
                  const activity = activities.find((item) => item.id === id)
                  if (activity && !pending) onMoveActivity(activity, date)
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-primary font-semibold">
                    {formatTripActivityDate(date, locale)}
                  </h3>
                  <Button
                    disabled={pending}
                    onClick={() => onOpenActivity(undefined, date)}
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
                          draggable={!pending}
                          onDragStart={(event) =>
                            event.dataTransfer.setData('text/plain', activity.id)
                          }
                          className="border-line bg-paper rounded-xl border p-4"
                        >
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <button
                              disabled={pending}
                              className="min-w-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                              onClick={() => onOpenActivity(activity)}
                              type="button"
                            >
                              <span className="text-champagne-ink text-xs font-semibold uppercase">
                                {t(`create.activityTypes.${activity.activityType}`)}
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
                                disabled={pending || dates.indexOf(date) <= 0}
                                onClick={() =>
                                  onMoveActivity(activity, dates[dates.indexOf(date) - 1] ?? date)
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
                                disabled={pending || dates.indexOf(date) >= dates.length - 1}
                                onClick={() =>
                                  onMoveActivity(activity, dates[dates.indexOf(date) + 1] ?? date)
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
                                disabled={pending || activity.startMinute < 15}
                                onClick={() =>
                                  void onUpdateActivity(activity, {
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
                                disabled={pending || activity.endMinute > 1425}
                                onClick={() =>
                                  void onUpdateActivity(activity, {
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
                                disabled={
                                  pending || activity.endMinute - activity.startMinute <= 15
                                }
                                onClick={() =>
                                  void onUpdateActivity(activity, {
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
                                disabled={pending || activity.endMinute >= 1440}
                                onClick={() =>
                                  void onUpdateActivity(activity, {
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
                                disabled={pending}
                                onClick={() => void onDeleteActivity(activity.id)}
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
  )
}
