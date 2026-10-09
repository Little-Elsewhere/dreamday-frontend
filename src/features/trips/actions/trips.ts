'use server'

import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'

import { ROUTES } from '@/constants/routes'
import {
  deleteTripActivitySchema,
  publishTripFieldsSchema,
  publishTripSchema,
  tripActivitySchema,
  tripDraftSchema,
  tripNoteSchema,
} from '@/features/trips/schemas/trip'
import { getSupabaseContext } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { fieldError, messageError, systemError } from '@/utils/action-result'
import type { ActionFailure, ActionResult } from '@/types/action-result'
import type { ServerSupabaseClient } from '@/types/supabase'
import type { TripActivity, TripDraft } from '@/features/trips/types/trip'
import { toTripActivity } from '@/features/trips/utils/trip'

const revalidateTrips = (tripId?: string): void => {
  revalidatePath('/[locale]/trips', 'page')
  revalidatePath('/[locale]/trips/create', 'page')
  if (tripId) revalidatePath('/[locale]/trips/[tripId]', 'page')
}

const getDraft = async (supabase: ServerSupabaseClient, tripId: string, ownerId: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select('start_date, end_date')
    .eq('id', tripId)
    .eq('owner_id', ownerId)
    .eq('lifecycle', 'draft')
    .maybeSingle()
  if (error) throw new Error('Could not load trip draft')
  return data
}

const publishFieldError = (
  field: unknown,
  message: string | undefined,
): ActionFailure<keyof TripDraft> => {
  if (field === 'endDate' && message === 'trips.create.errors.endBeforeStart') {
    return fieldError('endDate', message)
  }

  if (field === 'name') return fieldError('name', 'trips.create.errors.nameRequired')
  if (field === 'startDate') {
    return fieldError('startDate', 'trips.create.errors.startDateRequired')
  }
  if (field === 'endDate') return fieldError('endDate', 'trips.create.errors.endDateRequired')
  return fieldError('pace', 'trips.create.errors.paceRequired')
}

export const saveTripDraft = async (
  values: unknown,
): Promise<ActionResult<{ id: string }, keyof TripDraft>> => {
  const validated = tripDraftSchema.parse(values)

  try {
    const { supabase, userId: ownerId } = await getSupabaseContext()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
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
      ? await supabase
          .from('trips')
          .update(payload)
          .eq('id', existing.id)
          .select('id')
          .maybeSingle()
      : await supabase
          .from('trips')
          .insert({ ...payload, owner_id: ownerId, lifecycle: 'draft' })
          .select('id')
          .maybeSingle()

    if (result.error) return systemError()
    if (!result.data) {
      return existing ? messageError('trips.errors.draftNotFound') : systemError()
    }
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
    const { supabase, userId: ownerId } = await getSupabaseContext()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const trip = await getDraft(supabase, validated.tripId, ownerId)
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
          .maybeSingle()
      : await supabase.from('trip_activities').insert(payload).select('*').maybeSingle()

    if (result.error) {
      if (
        result.error.code === '23514' &&
        result.error.message === 'Activity date must be within the trip date range'
      ) {
        return fieldError('activityDate', 'trips.create.errors.activityOutsideTrip')
      }
      return systemError()
    }
    if (!result.data) return messageError('trips.errors.draftNotFound')
    revalidateTrips(validated.tripId)
    return { success: true, data: toTripActivity(result.data) }
  } catch {
    return systemError()
  }
}

export const deleteTripActivity = async (values: unknown): Promise<ActionResult<null>> => {
  const validated = deleteTripActivitySchema.parse(values)

  try {
    const { supabase, userId: ownerId } = await getSupabaseContext()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const trip = await getDraft(supabase, validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')

    const { data, error } = await supabase
      .from('trip_activities')
      .delete()
      .eq('trip_id', validated.tripId)
      .eq('id', validated.activityId)
      .select('id')
      .maybeSingle()
    if (error) return systemError()
    if (!data) return messageError('trips.errors.draftNotFound')
    revalidateTrips(validated.tripId)
    return { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const saveTripNote = async (values: unknown): Promise<ActionResult<null>> => {
  const validated = tripNoteSchema.parse(values)

  try {
    const { supabase, userId: ownerId } = await getSupabaseContext()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const trip = await getDraft(supabase, validated.tripId, ownerId)
    if (!trip) return messageError('trips.errors.draftNotFound')

    const { data, error } = await supabase
      .from('trips')
      .update({ note: validated.note, updated_at: new Date().toISOString() })
      .eq('id', validated.tripId)
      .select('id')
      .maybeSingle()
    if (error) return systemError()
    if (!data) return messageError('trips.errors.draftNotFound')
    revalidateTrips(validated.tripId)
    return { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const publishTrip = async (values: unknown): Promise<ActionFailure<keyof TripDraft>> => {
  const validated = publishTripSchema.parse(values)

  try {
    const { supabase, userId: ownerId } = await getSupabaseContext()
    if (!ownerId) return messageError('trips.errors.sessionExpired')
    const { data: fullTrip, error: tripError } = await supabase
      .from('trips')
      .select('name, start_date, end_date, pace')
      .eq('id', validated.tripId)
      .eq('owner_id', ownerId)
      .eq('lifecycle', 'draft')
      .maybeSingle()
    if (tripError) return systemError()
    if (!fullTrip) return messageError('trips.errors.draftNotFound')
    const publishFields = publishTripFieldsSchema.safeParse({
      name: fullTrip.name,
      startDate: fullTrip.start_date,
      endDate: fullTrip.end_date,
      pace: fullTrip.pace,
    })
    if (!publishFields.success) {
      const firstIssue = publishFields.error.issues[0]
      return publishFieldError(firstIssue?.path[0], firstIssue?.message)
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

    const { data, error } = await supabase
      .from('trips')
      .update({ lifecycle: 'published', updated_at: new Date().toISOString() })
      .eq('id', validated.tripId)
      .select('id')
      .maybeSingle()
    if (
      error?.code === '23514' &&
      error.message === 'Trip activities must fall within the trip date range'
    ) {
      return fieldError('startDate', 'trips.create.errors.activityOutsideTrip')
    }
    if (error) return systemError()
    if (!data) return messageError('trips.errors.draftNotFound')
    revalidateTrips(validated.tripId)
  } catch {
    return systemError()
  }

  const locale = await getLocale()
  return redirect({ href: ROUTES.PRIVATE.TRIP_DETAIL(validated.tripId), locale })
}
