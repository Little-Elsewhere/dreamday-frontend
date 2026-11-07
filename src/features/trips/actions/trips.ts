'use server'

import { API_ROUTES } from '@/constants/api-routes'
import { TRIP_MESSAGE_CODE } from '@/features/trips/constants/codes'
import { TRIP_PACES } from '@/features/trips/constants/trips'
import {
  tripActivityResponseSchema,
  tripDetailResponseSchema,
  tripListResponseSchema,
} from '@/features/trips/schemas/api'
import {
  publishTripFieldsSchema,
  tripActivitySchema,
  tripDraftSchema,
  tripIdSchema,
  tripNoteSchema,
} from '@/features/trips/schemas/trip'
import type { TripActivity, TripCard, TripDetail, TripDraft } from '@/features/trips/types/trip'
import {
  authedDel,
  authedGet,
  authedPatch,
  authedPost,
  authedPostForm,
} from '@/features/trips/utils/authed-request'
import { mapTripCard, mapTripDetail, mapTripDraft } from '@/features/trips/utils/map-trip'
import { messageResponseSchema } from '@/schemas/api'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'

const systemError = () => messageError('trips.create.errors.system')

const toDraftBody = (input: {
  name: string
  destination: string
  description: string
  startDate: string
  endDate: string
  pace: string
  note: string
  timezone?: string
}) => ({
  name: input.name,
  destination: input.destination,
  description: input.description,
  start_date: input.startDate || null,
  end_date: input.endDate || null,
  pace:
    input.pace && TRIP_PACES.includes(input.pace as (typeof TRIP_PACES)[number])
      ? input.pace
      : null,
  note: input.note,
  timezone: input.timezone || 'Asia/Ho_Chi_Minh',
})

export const getTrips = async (): Promise<TripCard[]> => {
  const result = await authedGet(API_ROUTES.TRIPS.LIST, tripListResponseSchema)
  if (!result.ok) return []
  return result.data.items.map(mapTripCard)
}

export const getDeletedTrips = async (): Promise<TripCard[]> => {
  const result = await authedGet(API_ROUTES.TRIPS.DELETED, tripListResponseSchema)
  if (!result.ok) return []
  return result.data.items.map(mapTripCard)
}

export const getCurrentDraft = async (): Promise<TripDraft | null> => {
  const result = await authedGet(API_ROUTES.TRIPS.DRAFT, tripDetailResponseSchema)
  if (!result.ok) {
    if (result.code === TRIP_MESSAGE_CODE.DRAFT_NOT_FOUND) return null
    return null
  }
  return mapTripDraft(result.data)
}

export const getTripDetail = async (tripId: string): Promise<TripDetail | null> => {
  const parsed = tripIdSchema.safeParse(tripId)
  if (!parsed.success) return null
  const result = await authedGet(API_ROUTES.TRIPS.DETAIL(parsed.data), tripDetailResponseSchema)
  if (!result.ok) return null
  return mapTripDetail(result.data)
}

export const getTripDraftById = async (tripId: string): Promise<TripDraft | null> => {
  const parsed = tripIdSchema.safeParse(tripId)
  if (!parsed.success) return null
  const result = await authedGet(API_ROUTES.TRIPS.DETAIL(parsed.data), tripDetailResponseSchema)
  if (!result.ok) return null
  return mapTripDraft(result.data)
}

export const saveDraft = async (input: {
  tripId?: string
  name: string
  destination: string
  description: string
  startDate: string
  endDate: string
  pace: string
  note: string
  timezone?: string
}): Promise<ActionResult<TripDraft>> => {
  const parsed = tripDraftSchema.safeParse({
    name: input.name,
    destination: input.destination,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    pace: input.pace === '' ? '' : input.pace,
    coverPath: null,
    note: input.note,
  })
  if (!parsed.success) return systemError()

  const body = toDraftBody({ ...parsed.data, timezone: input.timezone })

  if (input.tripId) {
    const id = tripIdSchema.safeParse(input.tripId)
    if (!id.success) return systemError()
    const result = await authedPatch(
      API_ROUTES.TRIPS.DETAIL(id.data),
      tripDetailResponseSchema,
      body,
    )
    if (result.ok) return { success: true, data: mapTripDraft(result.data) }
    if (result.code === TRIP_MESSAGE_CODE.INVALID_TRIP_DATES) {
      return messageError('trips.create.errors.endBeforeStart')
    }
    return systemError()
  }

  const created = await authedPost(API_ROUTES.TRIPS.LIST, tripDetailResponseSchema, body)
  if (created.ok) return { success: true, data: mapTripDraft(created.data) }

  if (created.code === TRIP_MESSAGE_CODE.DRAFT_ALREADY_EXISTS) {
    const draft = await getCurrentDraft()
    if (!draft) return messageError('trips.create.errors.draftExists')
    const updated = await authedPatch(
      API_ROUTES.TRIPS.DETAIL(draft.id),
      tripDetailResponseSchema,
      body,
    )
    if (updated.ok) return { success: true, data: mapTripDraft(updated.data) }
  }

  if (created.code === TRIP_MESSAGE_CODE.INVALID_TRIP_DATES) {
    return messageError('trips.create.errors.endBeforeStart')
  }
  return systemError()
}

export const publishTrip = async (
  tripId: string,
  fields: {
    name: string
    startDate: string
    endDate: string
    pace: string
    timezone?: string
  },
): Promise<ActionResult<TripDetail>> => {
  const id = tripIdSchema.safeParse(tripId)
  const fieldsParsed = publishTripFieldsSchema.safeParse(fields)
  if (!id.success || !fieldsParsed.success) {
    return messageError('trips.create.errors.publishRequired')
  }

  const patched = await authedPatch(API_ROUTES.TRIPS.DETAIL(id.data), tripDetailResponseSchema, {
    name: fieldsParsed.data.name,
    start_date: fieldsParsed.data.startDate,
    end_date: fieldsParsed.data.endDate,
    pace: fieldsParsed.data.pace,
    timezone: fields.timezone || 'Asia/Ho_Chi_Minh',
  })
  if (!patched.ok) {
    if (patched.code === TRIP_MESSAGE_CODE.INVALID_TRIP_DATES) {
      return messageError('trips.create.errors.endBeforeStart')
    }
    return systemError()
  }

  const published = await authedPost(API_ROUTES.TRIPS.PUBLISH(id.data), tripDetailResponseSchema)
  if (published.ok) return { success: true, data: mapTripDetail(published.data) }
  if (published.code === TRIP_MESSAGE_CODE.PUBLISH_VALIDATION_FAILED) {
    return messageError('trips.create.errors.publishRequired')
  }
  if (published.code === TRIP_MESSAGE_CODE.ACTIVITY_OUTSIDE_TRIP) {
    return messageError('trips.create.errors.activityOutsideTrip')
  }
  return systemError()
}

export const softDeleteTrip = async (tripId: string): Promise<ActionResult<{ deleted: true }>> => {
  const id = tripIdSchema.safeParse(tripId)
  if (!id.success) return systemError()
  const result = await authedDel(API_ROUTES.TRIPS.DETAIL(id.data), messageResponseSchema)
  if (result.ok) return { success: true, data: { deleted: true } }
  if (result.code === TRIP_MESSAGE_CODE.TRIP_NOT_FOUND) {
    return messageError('detail.errors.notFound')
  }
  return systemError()
}

export const restoreTrip = async (tripId: string): Promise<ActionResult<TripDetail>> => {
  const id = tripIdSchema.safeParse(tripId)
  if (!id.success) return systemError()
  const result = await authedPost(API_ROUTES.TRIPS.RESTORE(id.data), tripDetailResponseSchema)
  if (result.ok) return { success: true, data: mapTripDetail(result.data) }
  if (result.code === TRIP_MESSAGE_CODE.DRAFT_ALREADY_EXISTS) {
    return messageError('trips.create.errors.draftExists')
  }
  return systemError()
}

export const uploadTripCover = async (
  tripId: string,
  formData: FormData,
): Promise<ActionResult<TripDraft>> => {
  const id = tripIdSchema.safeParse(tripId)
  if (!id.success) return systemError()
  const result = await authedPostForm(
    API_ROUTES.TRIPS.COVER(id.data),
    tripDetailResponseSchema,
    formData,
  )
  if (result.ok) return { success: true, data: mapTripDraft(result.data) }
  if (result.code === TRIP_MESSAGE_CODE.INVALID_COVER) {
    return messageError('trips.create.errors.invalidCover')
  }
  return systemError()
}

export const removeTripCover = async (tripId: string): Promise<ActionResult<TripDraft>> => {
  const id = tripIdSchema.safeParse(tripId)
  if (!id.success) return systemError()
  const result = await authedDel(API_ROUTES.TRIPS.COVER(id.data), tripDetailResponseSchema)
  if (result.ok) return { success: true, data: mapTripDraft(result.data) }
  return systemError()
}

export const saveTripNote = async (
  tripId: string,
  note: string,
): Promise<ActionResult<TripDraft>> => {
  const parsed = tripNoteSchema.safeParse({ tripId, note })
  if (!parsed.success) return systemError()
  const result = await authedPatch(
    API_ROUTES.TRIPS.DETAIL(parsed.data.tripId),
    tripDetailResponseSchema,
    { note: parsed.data.note },
  )
  if (result.ok) return { success: true, data: mapTripDraft(result.data) }
  return systemError()
}

export const saveTripActivity = async (input: {
  tripId: string
  activityId?: string
  title: string
  activityDate: string
  activityType: TripActivity['activityType']
  startMinute: number
  endMinute: number
  note: string
}): Promise<ActionResult<TripActivity>> => {
  const parsed = tripActivitySchema.safeParse(input)
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path.includes('endMinute'))) {
      return messageError('trips.create.errors.endTimeBeforeStart')
    }
    return systemError()
  }

  const body = {
    title: parsed.data.title,
    activity_date: parsed.data.activityDate,
    activity_type: parsed.data.activityType,
    start_minute: parsed.data.startMinute,
    end_minute: parsed.data.endMinute,
    note: parsed.data.note,
  }

  if (parsed.data.activityId) {
    const result = await authedPatch(
      API_ROUTES.TRIPS.ACTIVITY(parsed.data.tripId, parsed.data.activityId),
      tripActivityResponseSchema,
      body,
    )
    if (result.ok) {
      return {
        success: true,
        data: {
          id: result.data.id,
          title: result.data.title,
          activityDate: result.data.activity_date,
          activityType: result.data.activity_type,
          startMinute: result.data.start_minute,
          endMinute: result.data.end_minute,
          note: result.data.note,
        },
      }
    }
    if (result.code === TRIP_MESSAGE_CODE.ACTIVITY_OUTSIDE_TRIP) {
      return messageError('trips.create.errors.activityOutsideTrip')
    }
    return systemError()
  }

  const created = await authedPost(
    API_ROUTES.TRIPS.ACTIVITIES(parsed.data.tripId),
    tripActivityResponseSchema,
    body,
  )
  if (created.ok) {
    return {
      success: true,
      data: {
        id: created.data.id,
        title: created.data.title,
        activityDate: created.data.activity_date,
        activityType: created.data.activity_type,
        startMinute: created.data.start_minute,
        endMinute: created.data.end_minute,
        note: created.data.note,
      },
    }
  }
  if (created.code === TRIP_MESSAGE_CODE.ACTIVITY_OUTSIDE_TRIP) {
    return messageError('trips.create.errors.activityOutsideTrip')
  }
  return systemError()
}

export const deleteTripActivity = async (
  tripId: string,
  activityId: string,
): Promise<ActionResult<{ deleted: true }>> => {
  const result = await authedDel(
    API_ROUTES.TRIPS.ACTIVITY(tripId, activityId),
    messageResponseSchema,
  )
  if (result.ok) return { success: true, data: { deleted: true } }
  return systemError()
}

export const ensureTripId = async (
  tripId: string | null,
  draftInput: {
    name: string
    destination: string
    description: string
    startDate: string
    endDate: string
    pace: string
    note: string
    timezone?: string
  },
): Promise<ActionResult<{ tripId: string }>> => {
  if (tripId) {
    const parsed = tripIdSchema.safeParse(tripId)
    if (parsed.success) return { success: true, data: { tripId: parsed.data } }
  }
  const saved = await saveDraft(draftInput)
  if (!saved.success) return saved
  return { success: true, data: { tripId: saved.data.id } }
}
