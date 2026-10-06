import { z } from 'zod'

import { dateSchema, timeZoneSchema, titleSchema, tripIdSchema } from './common'

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

export const scheduleSchema = z.object({
  tripId: tripIdSchema,
  title: titleSchema,
  note: z.string().trim().max(2000, { error: 'trips.errors.validation.tooLong' }).default(''),
  location: z.string().trim().max(200, { error: 'trips.errors.validation.tooLong' }).default(''),
  tripDay: dateSchema,
  startLocal: z.iso.datetime({ local: true, error: 'trips.errors.validation.invalidDateTime' }),
  endLocal: optionalLocalDateTimeSchema,
  startTimeZone: timeZoneSchema,
  endTimeZone: timeZoneSchema,
  startFold: optionalFoldSchema,
  endFold: optionalFoldSchema,
})
