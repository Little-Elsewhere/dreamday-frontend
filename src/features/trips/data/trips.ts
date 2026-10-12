import 'server-only'

import type { TripCard, TripDetail, TripDraft } from '@/features/trips/types/trip'

export const getTrips = async (): Promise<TripCard[]> => {
  // TODO: Load the signed-in user's trips from the API.
  return []
}

export const getCurrentDraft = async (): Promise<TripDraft | null> => {
  // TODO: Load the current trip draft from the API.
  return null
}

export const getTripDetail = async (_tripId: string): Promise<TripDetail | null> => {
  // TODO: Load a published trip from the API.
  return null
}
