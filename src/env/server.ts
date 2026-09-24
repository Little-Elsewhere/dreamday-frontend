import 'server-only'

import { serverEnvSchema } from '@/schemas/env'

export const serverEnv = serverEnvSchema.parse(process.env)
