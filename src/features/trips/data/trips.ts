import 'server-only'

import { cache } from 'react'
import { io } from 'next/cache'

import { tripIdSchema } from '@/features/trips/schemas/trip'
import { getSupabaseContext } from '@/lib/supabase/server'
import type { TripCard, TripDetail, TripDraft, TripRow } from '@/features/trips/types/trip'
import type { ServerSupabaseClient } from '@/types/supabase'
import {
  getAppDate,
  getTripDuration,
  getTripStatus,
  toTripActivity,
} from '@/features/trips/utils/trip'

type TripCardRow = Pick<
  TripRow,
  'id' | 'name' | 'destination' | 'description' | 'start_date' | 'end_date' | 'pace' | 'cover_path'
>
type TripDraftRow = TripCardRow & Pick<TripRow, 'note'>

const getCoverUrls = async (
  supabase: ServerSupabaseClient,
  coverPaths: string[],
): Promise<Map<string, string>> => {
  const paths = [...new Set(coverPaths.filter(Boolean))]
  if (paths.length === 0) return new Map()

  const { data, error } = await supabase.storage.from('trip-covers').createSignedUrls(paths, 3600)
  if (error) return new Map()

  return new Map(
    data.flatMap(({ path, signedUrl }) => (path && signedUrl ? [[path, signedUrl] as const] : [])),
  )
}

const getCoverUrl = async (
  supabase: ServerSupabaseClient,
  coverPath: string | null,
): Promise<string | null> => {
  if (!coverPath) return null
  return (await getCoverUrls(supabase, [coverPath])).get(coverPath) ?? null
}

const getUserContext = async () => {
  await io()
  return getSupabaseContext()
}

const toTripCard = (trip: TripCardRow, today: string, coverUrl: string | null): TripCard => {
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
    coverUrl,
    status: getTripStatus(trip.end_date, today),
    durationDays: getTripDuration(trip.start_date, trip.end_date),
  }
}

export const getTrips = async (): Promise<TripCard[]> => {
  const { supabase, userId: ownerId } = await getUserContext()
  if (!ownerId) return []

  const today = getAppDate(new Date())
  const result = await supabase
    .from('trips')
    .select('id, name, destination, description, start_date, end_date, pace, cover_path')
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'published')
    .order('start_date', { ascending: true })

  const { data, error } = result
  if (error) throw new Error('Could not load trips')

  const trips = data ?? []
  const coverUrls = await getCoverUrls(
    supabase,
    trips.flatMap((trip) => (trip.cover_path ? [trip.cover_path] : [])),
  )

  return trips.map((trip) =>
    toTripCard(trip, today, trip.cover_path ? (coverUrls.get(trip.cover_path) ?? null) : null),
  )
}

const toDraft = async (supabase: ServerSupabaseClient, trip: TripDraftRow): Promise<TripDraft> => {
  const [activitiesResult, coverUrl] = await Promise.all([
    supabase
      .from('trip_activities')
      .select('*')
      .eq('trip_id', trip.id)
      .order('activity_date')
      .order('start_minute')
      .order('id'),
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
  if (!tripIdSchema.safeParse(tripId).success) return null

  const { supabase, userId: ownerId } = await getUserContext()
  if (!ownerId) return null

  const today = getAppDate(new Date())
  const { data: trip, error } = await supabase
    .from('trips')
    .select('id, name, destination, description, start_date, end_date, pace, cover_path, note')
    .eq('id', tripId)
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'published')
    .maybeSingle()

  if (error) throw new Error('Could not load trip detail')
  if (!trip) return null

  const [activitiesResult, coverUrl] = await Promise.all([
    supabase
      .from('trip_activities')
      .select('*')
      .eq('trip_id', trip.id)
      .order('activity_date')
      .order('start_minute')
      .order('id'),
    getCoverUrl(supabase, trip.cover_path),
  ])

  if (activitiesResult.error) throw new Error('Could not load trip detail')
  return {
    ...toTripCard(trip, today, coverUrl),
    note: trip.note,
    activities: (activitiesResult.data ?? []).map(toTripActivity),
  }
})
