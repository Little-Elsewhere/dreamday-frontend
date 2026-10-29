import 'server-only'

import type { TripCard, TripDetail, TripDraft } from '@/features/trips/types/trip'

export const getTrips = async (): Promise<TripCard[]> => {
  return []
}

export const getCurrentDraft = async (): Promise<TripDraft | null> => {
  return null
}

export const getTripDetail = async (tripId: string): Promise<TripDetail | null> => {
  void tripId
  return null
}
