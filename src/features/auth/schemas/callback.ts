import { z } from 'zod'

import { AuthCallbackType } from '@/features/auth/constants/auth-callback-type'

export const confirmationSchema = z.object({
  token_hash: z.string().min(1).max(512),
  type: z.enum(AuthCallbackType),
})
