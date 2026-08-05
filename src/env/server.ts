import 'server-only'

import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_DEFAULT_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
})

export const env = serverEnvSchema.parse(process.env)
