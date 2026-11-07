import { ACTIVITY_TYPES, TRIP_PACES } from '@/features/trips/constants/trips'

export type TripPace = (typeof TRIP_PACES)[number]
export type ActivityType = (typeof ACTIVITY_TYPES)[number]
export type TripLifecycle = 'draft' | 'published'
export type TripVisibility = 'private' | 'public'
export type TripMemberRole = 'owner' | 'member'
export type TripStatus = 'upcoming' | 'past'
export type TripListFilter = 'all' | TripStatus

export interface TripActivity {
  id: string
  title: string
  activityDate: string
  activityType: ActivityType
  startMinute: number
  endMinute: number
  note: string
}

export interface TripCard {
  id: string
  name: string
  destination: string
  description: string
  startDate: string
  endDate: string
  pace: TripPace
  visibility: TripVisibility
  coverUrl: string | null
  status: TripStatus
  durationDays: number
}

export interface TripDetail extends TripCard {
  note: string
  activities: TripActivity[]
}

export interface TripMember {
  id: string
  userId: string
  email: string
  role: TripMemberRole
}

export interface TripDraft {
  id: string
  name: string
  destination: string
  description: string
  startDate: string
  endDate: string
  pace: TripPace | ''
  timezone: string
  visibility: TripVisibility
  coverPath: string | null
  coverUrl: string | null
  note: string
  activities: TripActivity[]
}
