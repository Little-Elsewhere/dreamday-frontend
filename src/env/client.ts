import { z } from 'zod'

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_DEFAULT_TITLE: z.string().min(1),
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: z.string().min(1),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1),
})

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_DEFAULT_TITLE: process.env.NEXT_PUBLIC_APP_DEFAULT_TITLE,
  NEXT_PUBLIC_APP_TITLE_TEMPLATE: process.env.NEXT_PUBLIC_APP_TITLE_TEMPLATE,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
})
