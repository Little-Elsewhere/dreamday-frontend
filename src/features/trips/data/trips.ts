import 'server-only'

import { cacheLife } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { TripCard, TripDetail, TripDraft, TripRow } from '@/features/trips/types/trip'
import {
  getAppDate,
  getCoverUrl,
  getTripDuration,
  getTripStatus,
  toTripActivity,
} from '@/features/trips/utils/trip'

const getOwnerId = async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || typeof data?.claims?.sub !== 'string') return null
  return data.claims.sub
}

const getCachedAppDate = async (): Promise<string> => {
  'use cache'
  cacheLife('default')
  return getAppDate(new Date())
}

const toTripCard = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  trip: TripRow,
  today: string,
): Promise<TripCard> => {
  if (!trip.start_date || !trip.end_date || !trip.pace) {
    throw new Error('Published trip is missing required fields')
  }

  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    description: trip.description,
    startDate: trip.start_date,
    endDate: trip.end_date,
    pace: trip.pace as TripCard['pace'],
    coverUrl: await getCoverUrl(supabase, trip.cover_path),
    status: getTripStatus(trip.end_date, today),
    durationDays: getTripDuration(trip.start_date, trip.end_date),
  }
}

export const getTrips = async (): Promise<TripCard[]> => {
  const ownerId = await getOwnerId()
  if (!ownerId) return []

  const today = await getCachedAppDate()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'published')
    .order('start_date', { ascending: true })

  if (error) throw new Error('Could not load trips')
  return Promise.all((data ?? []).map((trip) => toTripCard(supabase, trip, today)))
}

const toDraft = async (trip: TripRow): Promise<TripDraft> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trip_activities')
    .select('*')
    .eq('trip_id', trip.id)
    .order('activity_date')
    .order('start_minute')

  if (error) throw new Error('Could not load trip activities')
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    description: trip.description,
    startDate: trip.start_date ?? '',
    endDate: trip.end_date ?? '',
    pace: (trip.pace as TripDraft['pace']) ?? '',
    coverPath: trip.cover_path,
    coverUrl: await getCoverUrl(supabase, trip.cover_path),
    note: trip.note,
    activities: (data ?? []).map(toTripActivity),
  }
}

export const getCurrentDraft = async (): Promise<TripDraft | null> => {
  const ownerId = await getOwnerId()
  if (!ownerId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'draft')
    .maybeSingle()

  if (error) throw new Error('Could not load trip draft')
  return data ? toDraft(data) : null
}

export const getTripDetail = async (tripId: string): Promise<TripDetail | null> => {
  const ownerId = await getOwnerId()
  if (!ownerId) return null

  const today = await getCachedAppDate()
  const supabase = await createClient()
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'published')
    .maybeSingle()

  if (error || !trip || !trip.start_date || !trip.end_date || !trip.pace) return null

  const { data: activities, error: activitiesError } = await supabase
    .from('trip_activities')
    .select('*')
    .eq('trip_id', trip.id)
    .order('activity_date')
    .order('start_minute')

  if (activitiesError) throw new Error('Could not load trip detail')
  const card = await toTripCard(supabase, trip, today)
  return { ...card, note: trip.note, activities: (activities ?? []).map(toTripActivity) }
}
