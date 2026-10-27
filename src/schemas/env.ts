import { z } from 'zod'

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_DEFAULT_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().min(1),

  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().default('https://us.i.posthog.com'),
})

export const serverEnvSchema = clientEnvSchema.extend({
  MAINTENANCE_MODE: z.enum(['true', 'false']).default('false'),
})
