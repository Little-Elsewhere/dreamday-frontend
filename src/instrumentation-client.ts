import posthog from 'posthog-js'
import { clientEnv } from '@/env/client'

if (clientEnv.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
  posthog.init(clientEnv.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-05-30',
  })
}
