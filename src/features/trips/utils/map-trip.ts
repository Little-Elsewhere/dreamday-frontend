import type {
  TripActivityResponse,
  TripCardResponse,
  TripDetailResponse,
} from '@/features/trips/schemas/api'
import type {
  TripActivity,
  TripCard,
  TripDetail,
  TripDraft,
  TripVisibility,
} from '@/features/trips/types/trip'
import { getTripDuration, getTripStatus } from '@/features/trips/utils/trip'

const todayIso = () => new Date().toISOString().slice(0, 10)

const coverProxyUrl = (tripId: string, hasCover: boolean): string | null =>
  hasCover ? `/api/trips/${tripId}/cover` : null

export const mapActivity = (activity: TripActivityResponse): TripActivity => ({
  id: activity.id,
  title: activity.title,
  activityDate: activity.activity_date,
  activityType: activity.activity_type,
  startMinute: activity.start_minute,
  endMinute: activity.end_minute,
  note: activity.note,
})

export const mapTripCard = (trip: TripCardResponse): TripCard => {
  const startDate = trip.start_date ?? ''
  const endDate = trip.end_date ?? ''
  const status = trip.status ?? (endDate ? getTripStatus(endDate, todayIso()) : 'upcoming')
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    description: trip.description,
    startDate,
    endDate,
    pace: trip.pace ?? 'balanced',
    visibility: trip.visibility,
    coverUrl: coverProxyUrl(trip.id, Boolean(trip.cover_url)),
    status,
    durationDays:
      trip.duration_days ?? (startDate && endDate ? getTripDuration(startDate, endDate) : 0),
  }
}

export const mapTripDetail = (trip: TripDetailResponse): TripDetail => ({
  ...mapTripCard(trip),
  note: trip.note,
  activities: trip.activities.map(mapActivity),
})

export const mapTripDraft = (trip: TripDetailResponse): TripDraft => ({
  id: trip.id,
  name: trip.name,
  destination: trip.destination,
  description: trip.description,
  startDate: trip.start_date ?? '',
  endDate: trip.end_date ?? '',
  pace: trip.pace ?? '',
  timezone: trip.timezone,
  visibility: trip.visibility as TripVisibility,
  coverPath: trip.cover_path,
  coverUrl: coverProxyUrl(trip.id, Boolean(trip.cover_path || trip.cover_url)),
  note: trip.note,
  activities: trip.activities.map(mapActivity),
})
