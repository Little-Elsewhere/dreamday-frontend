import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { buttonVariants } from '@/components/ui/button'
import { TripHeader } from '@/features/trips/components/trip-header'
import { getTripDetail } from '@/features/trips/data/trips'
import { formatMinute, formatTripDetailDate, getTripDuration } from '@/features/trips/utils/trip'
import { Link } from '@/i18n/navigation'
import type { TripDetail } from '@/features/trips/types/trip'

type PageProps = { params: Promise<{ tripId: string }> }

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const [{ tripId }, t] = await Promise.all([params, getTranslations('trips.detail')])
  const trip = await getTripDetail(tripId)
  return trip
    ? {
        title: trip.name,
        description:
          trip.description || t('metadataDescription', { destination: trip.destination }),
      }
    : { title: t('notFoundTitle') }
}

const TripSchedule = ({
  trip,
  locale,
  labels,
}: {
  trip: TripDetail
  locale: string
  labels: (key: string) => string
}): ReactElement => {
  const activitiesByDate = new Map<string, TripDetail['activities']>()
  for (const activity of trip.activities) {
    const activities = activitiesByDate.get(activity.activityDate)
    if (activities) activities.push(activity)
    else activitiesByDate.set(activity.activityDate, [activity])
  }

  return (
    <section className="border-line bg-surface rounded-2xl border p-5 sm:p-8">
      <p className="text-champagne-ink text-xs font-semibold tracking-[0.16em] uppercase">
        {labels('scheduleEyebrow')}
      </p>
      <h2 className="text-primary mt-2 text-2xl font-medium tracking-tight">
        {labels('scheduleTitle')}
      </h2>
      {activitiesByDate.size === 0 ? (
        <p className="text-ink-soft bg-paper mt-6 rounded-xl p-5 text-sm">
          {labels('emptySchedule')}
        </p>
      ) : (
        <div className="mt-6 grid gap-5">
          {Array.from(activitiesByDate, ([date, activities]) => (
            <section key={date} className="border-line grid gap-3 border-l-2 pl-4 sm:pl-6">
              <h3 className="text-primary font-semibold">{formatTripDetailDate(date, locale)}</h3>
              <ul className="grid gap-3">
                {activities.map((activity) => (
                  <li key={activity.id} className="bg-paper rounded-xl p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <div>
                        <p className="text-champagne-ink text-xs font-semibold uppercase">
                          {labels(`activityTypes.${activity.activityType}`)}
                        </p>
                        <h4 className="text-primary mt-1 font-semibold">{activity.title}</h4>
                      </div>
                      <p className="text-ink-soft text-sm tabular-nums">
                        {formatMinute(activity.startMinute)} – {formatMinute(activity.endMinute)}
                      </p>
                    </div>
                    {activity.note && (
                      <p className="text-ink-soft mt-2 text-sm leading-relaxed">{activity.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}

const TripDetailPage = async ({ params }: PageProps): Promise<ReactElement> => {
  const [{ tripId }, locale, t] = await Promise.all([
    params,
    getLocale(),
    getTranslations('trips.detail'),
  ])
  const trip = await getTripDetail(tripId)
  if (!trip) notFound()
  const duration = getTripDuration(trip.startDate, trip.endDate)

  return (
    <main className="bg-paper text-ink min-h-svh antialiased">
      <TripHeader />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <Link
          className="text-ink-soft hover:text-primary inline-flex min-h-10 items-center gap-2 text-sm font-medium"
          href="/trips"
        >
          <span aria-hidden="true">←</span>
          {t('backToTrips')}
        </Link>
        <article className="border-line bg-surface mt-5 overflow-hidden rounded-3xl border">
          <div className="bg-paper relative aspect-video max-h-[32rem] min-h-56 overflow-hidden">
            {trip.coverUrl ? (
              <Image
                alt={t('coverAlt', { name: trip.name })}
                className="object-cover"
                fill
                priority
                sizes="100vw"
                src={trip.coverUrl}
                unoptimized
              />
            ) : (
              <div
                className="text-primary/50 from-champagne-soft via-paper to-muted grid h-full place-items-center bg-gradient-to-br text-6xl font-light"
                aria-hidden="true"
              >
                {trip.destination.slice(0, 1)}
              </div>
            )}
            <div className="from-primary/75 via-primary/10 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <p className="text-sm font-semibold tracking-[0.16em] uppercase">
                {trip.destination}
              </p>
              <h1 className="mt-2 max-w-4xl text-3xl leading-tight font-medium tracking-[-0.05em] sm:text-5xl">
                {trip.name}
              </h1>
              {trip.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                  {trip.description}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)] lg:p-10">
            <TripSchedule labels={t} locale={locale} trip={trip} />
            <aside className="grid content-start gap-5">
              <section className="border-line bg-paper rounded-2xl border p-5 sm:p-6">
                <p className="text-champagne-ink text-xs font-semibold tracking-[0.16em] uppercase">
                  {t('facts.eyebrow')}
                </p>
                <h2 className="text-primary mt-2 text-xl font-medium">{t('facts.title')}</h2>
                <dl className="mt-5 grid gap-4">
                  <div>
                    <dt className="text-ink-soft text-xs">{t('facts.destination')}</dt>
                    <dd className="text-primary mt-1 font-medium">
                      {trip.destination || t('facts.notSet')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft text-xs">{t('facts.dateRange')}</dt>
                    <dd className="text-primary mt-1 font-medium">
                      {formatTripDetailDate(trip.startDate, locale)} –{' '}
                      {formatTripDetailDate(trip.endDate, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft text-xs">{t('facts.duration')}</dt>
                    <dd className="text-primary mt-1 font-medium">
                      {t('facts.days', { count: duration })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft text-xs">{t('facts.pace')}</dt>
                    <dd className="text-primary mt-1 font-medium">{t(`paces.${trip.pace}`)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft text-xs">{t('facts.status')}</dt>
                    <dd className="text-primary mt-1 font-medium">{t(`status.${trip.status}`)}</dd>
                  </div>
                </dl>
              </section>
              <section className="border-line bg-paper rounded-2xl border p-5 sm:p-6">
                <p className="text-champagne-ink text-xs font-semibold tracking-[0.16em] uppercase">
                  {t('note.eyebrow')}
                </p>
                <h2 className="text-primary mt-2 text-xl font-medium">{t('note.title')}</h2>
                <p className="text-ink-soft mt-4 min-h-16 text-sm leading-relaxed whitespace-pre-wrap">
                  {trip.note || t('note.empty')}
                </p>
              </section>
              <Link
                className={buttonVariants({ className: 'w-full', variant: 'outline' })}
                href="/trips"
              >
                {t('backToTrips')}
              </Link>
            </aside>
          </div>
        </article>
      </div>
    </main>
  )
}

export default TripDetailPage
