import { z } from 'zod'

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_DEFAULT_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().min(1),
  NEXT_PUBLIC_APP_PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.url().min(1),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),

  // Posthog
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().default('https://us.i.posthog.com'),
})

export const serverEnvSchema = clientEnvSchema.extend({
  DATABASE_PASSWORD: z.string().min(1),
})
