import { test } from 'playwright/test'

import { isApiReachable } from './api'
import { isMailpitReachable } from './mailpit'

let cached: { api: boolean; mailpit: boolean } | null = null

const probe = async () => {
  if (cached) return cached
  const [api, mailpit] = await Promise.all([isApiReachable(), isMailpitReachable()])
  cached = { api, mailpit }
  return cached
}

/** Skip when the local API (+ Mailpit for email flows) is not available. */
export const requireBackend = async (needsMailpit = true) => {
  const status = await probe()
  test.skip(!status.api, 'Backend API is not reachable (set E2E_API_BASE_URL).')
  if (needsMailpit) {
    test.skip(!status.mailpit, 'Mailpit is not reachable (set E2E_MAILPIT_URL).')
  }
}
