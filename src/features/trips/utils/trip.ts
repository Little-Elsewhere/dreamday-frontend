import type {
  TripActivity,
  TripActivityRow,
  TripRow,
  TripStatus,
} from '@/features/trips/types/trip'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export const getAppDate = (date: Date): string =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: APP_TIME_ZONE,
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

export const isPublishedTrip = (trip: TripRow): boolean => trip.lifecycle === 'published'
