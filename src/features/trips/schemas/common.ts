import { z } from 'zod'

export const tripIdSchema = z.uuid({ error: 'trips.errors.validation.invalidSelection' })
export const dateSchema = z.iso.date({ error: 'trips.errors.validation.invalidDate' })
export const titleSchema = z
  .string()
  .trim()
  .min(1, { error: 'trips.errors.validation.required' })
  .max(200, { error: 'trips.errors.validation.tooLong' })

export const timeZoneSchema = z
  .string()
  .min(1, { error: 'trips.errors.validation.required' })
  .max(80, { error: 'trips.errors.validation.tooLong' })
  .refine(
    (zone) => {
      try {
        new Intl.DateTimeFormat('en', { timeZone: zone })
        return true
      } catch {
        return false
      }
    },
    { error: 'trips.errors.validation.invalidTimeZone' },
  )
