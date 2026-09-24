import { z } from 'zod'

import { ROUTES } from '@/constants/routes'

export const confirmationSchema = z.object({
  token_hash: z.string().min(1).max(512),
  type: z.enum(['email', 'signup', 'recovery']),
})

export const nextSchema = z.enum([ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.AUTH.UPDATE_PASSWORD])
