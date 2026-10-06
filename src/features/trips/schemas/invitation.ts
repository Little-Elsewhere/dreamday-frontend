import { z } from 'zod'

import { tripIdSchema } from './common'

export const invitationSchema = z.object({
  tripId: tripIdSchema,
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'trips.errors.validation.invalidEmail' }))
    .transform((email) => email.toLowerCase()),
  role: z.enum(['editor', 'member', 'viewer'], { error: 'trips.errors.validation.invalidRole' }),
})

export const acceptInvitationSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, { error: 'trips.errors.validation.invalidToken' }),
})
