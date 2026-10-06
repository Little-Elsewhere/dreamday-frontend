import { z } from 'zod'

import { titleSchema, tripIdSchema } from './common'

export const expenseSchema = z.object({
  tripId: tripIdSchema,
  title: titleSchema,
  amount: z.string().trim().min(1, { error: 'trips.errors.validation.required' }),
  paidByMembershipId: tripIdSchema,
  splitMembershipIds: z
    .array(tripIdSchema)
    .min(1, { error: 'trips.errors.validation.chooseSplit' }),
})

export const budgetSchema = z.object({
  tripId: tripIdSchema,
  amount: z.string().trim(),
})
