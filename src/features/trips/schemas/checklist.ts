import { z } from 'zod'

import { timeZoneSchema, tripIdSchema } from './common'

export const checklistSchema = z.object({
  tripId: tripIdSchema,
  title: z
    .string()
    .trim()
    .min(1, { error: 'trips.errors.validation.required' })
    .max(120, { error: 'trips.errors.validation.tooLong' }),
})

const optionalMemberIdSchema = z
  .union([z.literal(''), tripIdSchema])
  .transform((value) => value || undefined)

const optionalLocalDateTimeSchema = z
  .union([
    z.literal(''),
    z.iso.datetime({ local: true, error: 'trips.errors.validation.invalidDateTime' }),
  ])
  .transform((value) => value || undefined)

const optionalFoldSchema = z
  .union([
    z.literal(''),
    z.enum(['earlier', 'later'], { error: 'trips.errors.validation.invalidSelection' }),
  ])
  .transform((value) => value || undefined)

export const taskSchema = z
  .object({
    tripId: tripIdSchema,
    checklistId: tripIdSchema,
    title: z
      .string()
      .trim()
      .min(1, { error: 'trips.errors.validation.required' })
      .max(250, { error: 'trips.errors.validation.tooLong' }),
    assigneeMembershipId: optionalMemberIdSchema,
    dueLocal: optionalLocalDateTimeSchema,
    dueTimeZone: timeZoneSchema.optional(),
    dueFold: optionalFoldSchema,
  })
  .refine((value) => !value.dueLocal || Boolean(value.dueTimeZone), {
    path: ['dueTimeZone'],
    error: 'trips.errors.validation.timeZoneRequired',
  })

export const taskToggleSchema = z.object({
  tripId: tripIdSchema,
  taskId: tripIdSchema,
  isDone: z.boolean(),
})
