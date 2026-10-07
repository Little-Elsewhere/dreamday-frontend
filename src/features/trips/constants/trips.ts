import type { TripCreateErrorTranslationKey } from '@/features/trips/types/components'

export const TRIP_LIST_PAGE_SIZE = 6
export const TRIP_LIST_FILTERS = ['all', 'upcoming', 'past'] as const
export const MAX_TRIP_COVER_SIZE_BYTES = 2 * 1024 * 1024

export const TRIP_PACES = ['relaxed', 'balanced', 'active'] as const
export const ACTIVITY_TYPES = ['explore', 'meal', 'travel', 'stay', 'free'] as const
export const ACTIVITY_TIME_OPTIONS = Array.from({ length: 97 }, (_, index) => index * 15)

export const TRIP_APP_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export const PUBLISH_ERROR_TRANSLATION_KEYS: Record<string, TripCreateErrorTranslationKey> = {
  'trips.create.errors.nameRequired': 'create.errors.nameRequired',
  'trips.create.errors.startDateRequired': 'create.errors.startDateRequired',
  'trips.create.errors.endDateRequired': 'create.errors.endDateRequired',
  'trips.create.errors.endBeforeStart': 'create.errors.endBeforeStart',
  'trips.create.errors.paceRequired': 'create.errors.paceRequired',
  'trips.create.errors.activityOutsideTrip': 'create.errors.activityOutsideTrip',
}
