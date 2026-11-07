import { z } from 'zod'

import { ACTIVITY_TYPES, TRIP_PACES } from '@/features/trips/constants/trips'
import { utcInstantSchema } from '@/schemas/datetime'

export const tripActivityResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  activity_date: z.iso.date(),
  activity_type: z.enum(ACTIVITY_TYPES),
  start_minute: z.number().int(),
  end_minute: z.number().int(),
  note: z.string(),
  created_at: utcInstantSchema,
  updated_at: utcInstantSchema,
})

export const tripCardResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  destination: z.string(),
  description: z.string(),
  start_date: z.iso.date().nullable(),
  end_date: z.iso.date().nullable(),
  pace: z.enum(TRIP_PACES).nullable(),
  timezone: z.string(),
  lifecycle: z.enum(['draft', 'published']),
  visibility: z.enum(['private', 'public']),
  cover_url: z.string().nullable(),
  status: z.enum(['upcoming', 'past']).nullable(),
  duration_days: z.number().int().nullable(),
  created_at: utcInstantSchema,
  updated_at: utcInstantSchema,
  published_at: utcInstantSchema.nullable(),
  deleted_at: utcInstantSchema.nullable().optional(),
})

export const tripMemberResponseSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  email: z.email(),
  role: z.enum(['owner', 'member']),
  created_at: utcInstantSchema,
  updated_at: utcInstantSchema,
})

export const tripMemberListResponseSchema = z.object({
  items: z.array(tripMemberResponseSchema),
})

export const tripDetailResponseSchema = tripCardResponseSchema.extend({
  note: z.string(),
  cover_path: z.string().nullable(),
  activities: z.array(tripActivityResponseSchema),
})

export const tripListResponseSchema = z.object({
  items: z.array(tripCardResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
})

export type TripCardResponse = z.infer<typeof tripCardResponseSchema>
export type TripDetailResponse = z.infer<typeof tripDetailResponseSchema>
export type TripListResponse = z.infer<typeof tripListResponseSchema>
export type TripActivityResponse = z.infer<typeof tripActivityResponseSchema>
export type TripMemberResponse = z.infer<typeof tripMemberResponseSchema>
export type TripMemberListResponse = z.infer<typeof tripMemberListResponseSchema>
