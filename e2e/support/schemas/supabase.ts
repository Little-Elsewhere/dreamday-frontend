import { z } from 'zod'

export const localSupabaseStatusSchema = z.looseObject({
  API_URL: z.string().optional(),
  PUBLISHABLE_KEY: z.string().optional(),
  SECRET_KEY: z.string().optional(),
})

export type LocalSupabaseStatus = z.infer<typeof localSupabaseStatusSchema>
