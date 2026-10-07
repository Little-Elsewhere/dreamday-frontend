import type {
  TripActivity,
  TripActivityRow,
  TripCard,
  TripListFilter,
  TripStatus,
} from '@/features/trips/types/trip'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { TRIP_APP_TIME_ZONE } from '@/features/trips/constants/trips'

export const createUuidV4 = (): string => crypto.randomUUID()

export const createInitialTripActivity = (activityDate: string): Omit<TripActivity, 'id'> => ({
  title: '',
  activityDate,
  activityType: 'explore',
  startMinute: 9 * 60,
  endMinute: 10 * 60,
  note: '',
})

export const getTripDatesInRange = (start: string, end: string): string[] => {
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

const formatDateOnly = (
  date: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string =>
  new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  )

export const formatTripDate = (date: string, locale: string): string =>
  formatDateOnly(date, locale, { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTripActivityDate = (date: string, locale: string): string =>
  formatDateOnly(date, locale, { weekday: 'short', day: 'numeric', month: 'short' })

export const formatTripDetailDate = (date: string, locale: string): string =>
  formatDateOnly(date, locale, { day: 'numeric', month: 'long', year: 'numeric' })

export const filterTrips = (
  trips: TripCard[],
  query: string,
  filter: TripListFilter,
  locale: string,
): TripCard[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  return trips.filter((trip) => {
    const matchesQuery =
      !normalizedQuery ||
      `${trip.name} ${trip.destination}`.toLocaleLowerCase(locale).includes(normalizedQuery)
    return matchesQuery && (filter === 'all' || trip.status === filter)
  })
}

export const getAppDate = (date: Date): string =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: TRIP_APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

export const getTripStatus = (endDate: string, today: string): TripStatus =>
  endDate < today ? 'past' : 'upcoming'

export const getTripDuration = (startDate: string, endDate: string): number => {
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  return Math.floor((end - start) / 86_400_000) + 1
}

export const formatMinute = (minute: number): string => {
  if (minute === 1440) return '24:00'
  const hours = Math.floor(minute / 60)
    .toString()
    .padStart(2, '0')
  const minutes = (minute % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const parseMinute = (value: string, allowMidnight = false): number => {
  if (allowMidnight && value === '24:00') return 1440
  const match = /^(?:([01]\d|2[0-3])):([0-5]\d)$/.exec(value)
  if (!match) return Number.NaN
  return Number(match[1]) * 60 + Number(match[2])
}

export const toTripActivity = (row: TripActivityRow): TripActivity => ({
  id: row.id,
  title: row.title,
  activityDate: row.activity_date,
  activityType: row.activity_type as TripActivity['activityType'],
  startMinute: row.start_minute,
  endMinute: row.end_minute,
  note: row.note,
})

export const getCoverUrl = async (
  supabase: SupabaseClient<Database>,
  coverPath: string | null,
): Promise<string | null> => {
  if (!coverPath) return null
  const { data, error } = await supabase.storage
    .from('trip-covers')
    .createSignedUrl(coverPath, 3600)
  if (error) return null
  return data?.signedUrl ?? null
}
