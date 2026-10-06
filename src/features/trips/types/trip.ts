import type { Database } from '@/types/database'

export const TRIP_PACES = ['relaxed', 'balanced', 'active'] as const
export type TripPace = (typeof TRIP_PACES)[number]

export const ACTIVITY_TYPES = ['explore', 'meal', 'travel', 'stay', 'free'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type TripLifecycle = 'draft' | 'published'
export type TripStatus = 'upcoming' | 'past'

export type TripRow = Database['public']['Tables']['trips']['Row']
export type TripActivityRow = Database['public']['Tables']['trip_activities']['Row']

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
  coverUrl: string | null
  status: TripStatus
  durationDays: number
}

export interface TripDetail extends TripCard {
  note: string
  activities: TripActivity[]
}

export interface TripDraft {
  id: string | null
  name: string
  destination: string
  description: string
  startDate: string
  endDate: string
  pace: TripPace | ''
  coverPath: string | null
  coverUrl: string | null
  note: string
  activities: TripActivity[]
}
