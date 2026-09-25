import { z } from 'zod'

export const confirmationSchema = z.object({
  token_hash: z.string().min(1).max(512),
  type: z.enum(['email', 'signup', 'recovery']),
})
