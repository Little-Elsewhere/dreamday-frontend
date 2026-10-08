import { z } from 'zod'

import { ACTIVITY_TYPES, TRIP_PACES } from '@/features/trips/constants/trips'

const optionalDateSchema = z.union([z.iso.date(), z.literal('')])

export const tripDraftSchema = z
  .object({
    name: z.string().trim().max(40),
    destination: z.string().trim().max(40),
    description: z.string().trim().max(100),
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    pace: z.union([z.enum(TRIP_PACES), z.literal('')]),
    coverPath: z.string().max(500).nullable(),
    note: z.string().max(1000),
  })
  .refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    path: ['endDate'],
    error: 'trips.create.errors.endBeforeStart',
  })

export const tripIdSchema = z.uuid()

export const publishTripSchema = z.object({ tripId: tripIdSchema })

export const publishTripFieldsSchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    pace: z.enum(TRIP_PACES),
  })
  .refine((value) => value.endDate >= value.startDate, {
    path: ['endDate'],
    error: 'trips.create.errors.endBeforeStart',
  })

export const tripActivitySchema = z
  .object({
    tripId: tripIdSchema,
    activityId: z.uuid().optional(),
    title: z.string().trim().min(1).max(80),
    activityDate: z.iso.date(),
    activityType: z.enum(ACTIVITY_TYPES),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
    note: z.string().max(500),
  })
  .refine((value) => value.endMinute > value.startMinute, {
    path: ['endMinute'],
    error: 'trips.create.errors.endTimeBeforeStart',
  })

export const deleteTripActivitySchema = z.object({
  tripId: tripIdSchema,
  activityId: z.uuid(),
})

export const tripNoteSchema = z.object({
  tripId: tripIdSchema,
  note: z.string().max(1000),
})

export type TripDraftInput = z.input<typeof tripDraftSchema>
export type TripActivityInput = z.input<typeof tripActivitySchema>
