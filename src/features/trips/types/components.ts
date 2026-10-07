import type { TripActivity, TripDraft } from '@/features/trips/types/trip'

export type TripDraftFormValues = Pick<
  TripDraft,
  'name' | 'destination' | 'description' | 'startDate' | 'endDate' | 'pace' | 'coverPath' | 'note'
>
export type TripActivityFormValues = Omit<TripActivity, 'id'> & { id?: string }
export type TripCreateErrorTranslationKey =
  | 'create.errors.nameRequired'
  | 'create.errors.startDateRequired'
  | 'create.errors.endDateRequired'
  | 'create.errors.endBeforeStart'
  | 'create.errors.paceRequired'
  | 'create.errors.activityOutsideTrip'
  | 'create.errors.publishRequired'
