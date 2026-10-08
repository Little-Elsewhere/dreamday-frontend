import { z } from 'zod'
import type { EmailOtpType as SupabaseEmailOtpType } from '@supabase/supabase-js'

import { AuthEmailOtpType } from '@/features/auth/constants/auth'

export const emailOtpTypeSchema = z
  .enum(AuthEmailOtpType)
  .transform((type): SupabaseEmailOtpType => type)

export const confirmationSchema = z.object({
  token_hash: z.string().min(1).max(512),
  type: emailOtpTypeSchema,
  next: z.string().max(2048).optional().catch(undefined),
})
