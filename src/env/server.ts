import 'server-only'

import { z } from 'zod'

const serverEnvSchema = z.object({
  DOPPLER_ENVIRONMENT: z.string().min(1).default('dev'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_DEFAULT_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
})

export const env = serverEnvSchema.parse(process.env)
