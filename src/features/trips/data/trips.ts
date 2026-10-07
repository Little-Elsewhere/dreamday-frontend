import 'server-only'

import { cache } from 'react'
import { cacheLife, io } from 'next/cache'

import { getSupabaseUserContext } from '@/lib/supabase/user-context'
import type { TripCard, TripDetail, TripDraft, TripRow } from '@/features/trips/types/trip'
import {
  getAppDate,
  getCoverUrl,
  getTripDuration,
  getTripStatus,
  toTripActivity,
} from '@/features/trips/utils/trip'

type TripCardRow = Pick<
  TripRow,
  'id' | 'name' | 'destination' | 'description' | 'start_date' | 'end_date' | 'pace' | 'cover_path'
>
type TripDraftRow = TripCardRow & Pick<TripRow, 'note'>
type ServerSupabaseClient = Awaited<ReturnType<typeof getSupabaseUserContext>>['supabase']

const getUserContext = async () => {
  await io()
  return getSupabaseUserContext()
}

const getCachedAppDate = async (): Promise<string> => {
  'use cache'
  cacheLife('default')
  return getAppDate(new Date())
}

const toTripCard = async (
  supabase: ServerSupabaseClient,
  trip: TripCardRow,
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
  const { supabase, userId: ownerId } = await getUserContext()
  if (!ownerId) return []

  const [today, result] = await Promise.all([
    getCachedAppDate(),
    supabase
      .from('trips')
      .select('id, name, destination, description, start_date, end_date, pace, cover_path')
      .eq('owner_id', ownerId)
      .eq('lifecycle', 'published')
      .order('start_date', { ascending: true }),
  ])

  const { data, error } = result
  if (error) throw new Error('Could not load trips')
  return Promise.all((data ?? []).map((trip) => toTripCard(supabase, trip, today)))
}

const toDraft = async (supabase: ServerSupabaseClient, trip: TripDraftRow): Promise<TripDraft> => {
  const [activitiesResult, coverUrl] = await Promise.all([
    supabase
      .from('trip_activities')
      .select('*')
      .eq('trip_id', trip.id)
      .order('activity_date')
      .order('start_minute'),
    getCoverUrl(supabase, trip.cover_path),
  ])

  if (activitiesResult.error) throw new Error('Could not load trip activities')
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    description: trip.description,
    startDate: trip.start_date ?? '',
    endDate: trip.end_date ?? '',
    pace: (trip.pace as TripDraft['pace']) ?? '',
    coverPath: trip.cover_path,
    coverUrl,
    note: trip.note,
    activities: (activitiesResult.data ?? []).map(toTripActivity),
  }
}

export const getCurrentDraft = async (): Promise<TripDraft | null> => {
  const { supabase, userId: ownerId } = await getUserContext()
  if (!ownerId) return null

  const { data, error } = await supabase
    .from('trips')
    .select('id, name, destination, description, start_date, end_date, pace, cover_path, note')
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'draft')
    .maybeSingle()

  if (error) throw new Error('Could not load trip draft')
  return data ? toDraft(supabase, data) : null
}

export const getTripDetail = cache(async (tripId: string): Promise<TripDetail | null> => {
  const { supabase, userId: ownerId } = await getUserContext()
  if (!ownerId) return null

  const [today, tripResult] = await Promise.all([
    getCachedAppDate(),
    supabase
      .from('trips')
      .select('id, name, destination, description, start_date, end_date, pace, cover_path, note')
      .eq('id', tripId)
      .eq('owner_id', ownerId)
      .eq('lifecycle', 'published')
      .maybeSingle(),
  ])
  const { data: trip, error } = tripResult

  if (error || !trip || !trip.start_date || !trip.end_date || !trip.pace) return null

  const [activitiesResult, card] = await Promise.all([
    supabase
      .from('trip_activities')
      .select('*')
      .eq('trip_id', trip.id)
      .order('activity_date')
      .order('start_minute'),
    toTripCard(supabase, trip, today),
  ])

  if (activitiesResult.error) throw new Error('Could not load trip detail')
  return { ...card, note: trip.note, activities: (activitiesResult.data ?? []).map(toTripActivity) }
})
