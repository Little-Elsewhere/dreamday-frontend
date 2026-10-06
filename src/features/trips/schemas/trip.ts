import { z } from 'zod'

import { dateSchema, timeZoneSchema, tripIdSchema } from './common'

export const currencyCodes = [
  'VND',
  'JPY',
  'KRW',
  'TWD',
  'USD',
  'EUR',
  'GBP',
  'SGD',
  'THB',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'HKD',
  'IDR',
  'MYR',
  'PHP',
  'INR',
] as const

export const currencyExponents: Record<(typeof currencyCodes)[number], number> = {
  VND: 0,
  JPY: 0,
  KRW: 0,
  TWD: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  SGD: 2,
  THB: 2,
  AUD: 2,
  CAD: 2,
  CHF: 2,
  CNY: 2,
  HKD: 2,
  IDR: 2,
  MYR: 2,
  PHP: 2,
  INR: 2,
}

const tripSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'trips.errors.validation.required' })
      .max(120, { error: 'trips.errors.validation.tooLong' }),
    destination: z
      .string()
      .trim()
      .min(1, { error: 'trips.errors.validation.required' })
      .max(160, { error: 'trips.errors.validation.tooLong' }),
    description: z
      .string()
      .trim()
      .max(1000, { error: 'trips.errors.validation.tooLong' })
      .default(''),
    startsOn: dateSchema,
    endsOn: dateSchema,
    timeZone: timeZoneSchema,
    currencyCode: z.enum(currencyCodes, { error: 'trips.errors.validation.invalidCurrency' }),
  })
  .refine((value) => value.endsOn >= value.startsOn, {
    path: ['endsOn'],
    error: 'trips.errors.validation.dateOrder',
  })

export const createTripSchema = tripSchema
export const updateTripSchema = tripSchema.safeExtend({ tripId: tripIdSchema })
