import { z } from 'zod'

import { utcInstantSchema } from '@/schemas/datetime'

export { type MessageResponse, messageResponseSchema } from '@/schemas/api'

export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal('bearer'),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1),
  refresh_expires_in: z.number().int().positive(),
})

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  is_email_verified: z.boolean(),
  created_at: utcInstantSchema,
})

export type TokenResponse = z.infer<typeof tokenResponseSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
