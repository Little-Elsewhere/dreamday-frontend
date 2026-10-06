'use server'

import { revalidatePath } from 'next/cache'

import {
  deleteTripActivitySchema,
  publishTripFieldsSchema,
  publishTripSchema,
  tripActivitySchema,
  tripDraftSchema,
  tripNoteSchema,
} from '@/features/trips/schemas/trip'
import { createClient } from '@/lib/supabase/server'
import { fieldError, messageError, systemError } from '@/utils/action-result'
import type { ActionResult } from '@/types/action-result'
import type { TripActivity, TripDraft } from '@/features/trips/types/trip'
import { toTripActivity } from '@/features/trips/utils/trip'

const getOwnerId = async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || typeof data?.claims?.sub !== 'string') return null
  return data.claims.sub
}

const revalidateTrips = (tripId?: string): void => {
  revalidatePath('/[locale]/trips', 'page')
  revalidatePath('/[locale]/trips/create', 'page')
  if (tripId) revalidatePath('/[locale]/trips/[tripId]', 'page')
}

const getDraft = async (tripId: string, ownerId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trips')
    .select('id, owner_id, lifecycle, start_date, end_date')
    .eq('id', tripId)
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'draft')
    .maybeSingle()
  return { supabase, trip: error ? null : data }
}

export const saveTripDraft = async (
  values: unknown,
): Promise<ActionResult<{ id: string }, keyof TripDraft>> => {
  const validated = tripDraftSchema.parse(values)

  try {
    const ownerId = await getOwnerId()
    if (!ownerId) return messageError('trips.errors.sessionExpired')

    const supabase = await createClient()
    const { data: existing, error: lookupError } = await supabase
      .from('trips')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('lifecycle', 'draft')
      .maybeSingle()
    if (lookupError) return systemError()

    if (
      validated.coverPath &&
      (!existing || !validated.coverPath.startsWith(`${ownerId}/${existing.id}/`))
    ) {
      return fieldError('coverPath', 'trips.create.errors.invalidCover')
    }

    const payload = {
      name: validated.name,
      destination: validated.destination,
      description: validated.description,
      start_date: validated.startDate || null,
      end_date: validated.endDate || null,
      pace: validated.pace || null,
      cover_path: validated.coverPath,
      note: validated.note,
      updated_at: new Date().toISOString(),
    }
    const result = existing
      ? await supabase.from('trips').update(payload).eq('id', existing.id).select('id').single()
      : validated.coverPath
        ? { data: null, error: new Error('Cover requires a saved draft') }
        : await supabase
            .from('trips')
            .insert({ ...payload, owner_id: ownerId, lifecycle: 'draft' })
            .select('id')
            .single()

    if (result.error || !result.data) return systemError()
    revalidateTrips(result.data.id)
    return { success: true, data: { id: result.data.id } }
  } catch {
    return systemError()
  }
}

export const saveTripActivity = async (
  values: unknown,
): Promise<ActionResult<TripActivity, keyof TripActivity>> => {
  const validated = tripActivitySchema.parse(values)

  try {
    const ownerId = await getOwnerId()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const { supabase, trip } = await getDraft(validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')
    if (
      (trip.start_date && validated.activityDate < trip.start_date) ||
      (trip.end_date && validated.activityDate > trip.end_date)
    ) {
      return fieldError('activityDate', 'trips.create.errors.activityOutsideTrip')
    }

    const payload = {
      trip_id: validated.tripId,
      title: validated.title,
      activity_date: validated.activityDate,
      activity_type: validated.activityType,
      start_minute: validated.startMinute,
      end_minute: validated.endMinute,
      note: validated.note,
      updated_at: new Date().toISOString(),
    }
    const result = validated.activityId
      ? await supabase
          .from('trip_activities')
          .update(payload)
          .eq('trip_id', validated.tripId)
          .eq('id', validated.activityId)
          .select('*')
          .single()
      : await supabase.from('trip_activities').insert(payload).select('*').single()

    if (result.error || !result.data) return systemError()
    revalidateTrips(validated.tripId)
    return { success: true, data: toTripActivity(result.data) }
  } catch {
    return systemError()
  }
}

export const deleteTripActivity = async (values: unknown): Promise<ActionResult<null>> => {
  const validated = deleteTripActivitySchema.parse(values)

  try {
    const ownerId = await getOwnerId()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const { supabase, trip } = await getDraft(validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')

    const { error } = await supabase
      .from('trip_activities')
      .delete()
      .eq('trip_id', validated.tripId)
      .eq('id', validated.activityId)
    if (error) return systemError()
    revalidateTrips(validated.tripId)
    return { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const saveTripNote = async (values: unknown): Promise<ActionResult<null>> => {
  const validated = tripNoteSchema.parse(values)

  try {
    const ownerId = await getOwnerId()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const { supabase, trip } = await getDraft(validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')

    const { error } = await supabase
      .from('trips')
      .update({ note: validated.note, updated_at: new Date().toISOString() })
      .eq('id', validated.tripId)
    if (error) return systemError()
    revalidateTrips(validated.tripId)
    return { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const publishTrip = async (values: unknown): Promise<ActionResult<{ id: string }>> => {
  const validated = publishTripSchema.parse(values)

  try {
    const ownerId = await getOwnerId()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const { supabase, trip } = await getDraft(validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')

    const { data: fullTrip, error: tripError } = await supabase
      .from('trips')
      .select('name, start_date, end_date, pace')
      .eq('id', validated.tripId)
      .single()
    if (tripError || !fullTrip) return systemError()
    const publishFields = publishTripFieldsSchema.safeParse({
      name: fullTrip.name,
      startDate: fullTrip.start_date,
      endDate: fullTrip.end_date,
      pace: fullTrip.pace,
    })
    if (!publishFields.success) {
      const firstIssue = publishFields.error.issues[0]
      const field = firstIssue?.path[0]
      if (field === 'name') return fieldError('name', 'trips.create.errors.nameRequired')
      if (field === 'startDate')
        return fieldError('startDate', 'trips.create.errors.startDateRequired')
      if (field === 'endDate' && firstIssue.message === 'trips.create.errors.endBeforeStart') {
        return fieldError('endDate', firstIssue.message)
      }
      if (field === 'endDate') return fieldError('endDate', 'trips.create.errors.endDateRequired')
      return fieldError('pace', 'trips.create.errors.paceRequired')
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('trip_activities')
      .select('activity_date')
      .eq('trip_id', validated.tripId)
    if (activitiesError) return systemError()
    const outsideTrip = activities?.some(
      (activity) =>
        activity.activity_date < publishFields.data.startDate ||
        activity.activity_date > publishFields.data.endDate,
    )
    if (outsideTrip) return fieldError('startDate', 'trips.create.errors.activityOutsideTrip')

    const { error } = await supabase
      .from('trips')
      .update({ lifecycle: 'published', updated_at: new Date().toISOString() })
      .eq('id', validated.tripId)
    if (error) return systemError()
    revalidateTrips(validated.tripId)
    return { success: true, data: { id: validated.tripId } }
  } catch {
    return systemError()
  }
}
