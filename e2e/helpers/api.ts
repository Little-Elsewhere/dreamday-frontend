import { E2E_API_BASE_URL, E2E_DEFAULT_PASSWORD } from './env'
import { waitForEmailToken } from './mailpit'

export type TokenPair = {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
}

export type TripDetail = {
  id: string
  name: string
  visibility: 'private' | 'public'
  lifecycle: 'draft' | 'published'
  cover_url: string | null
}

const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' }

const apiFetch = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${E2E_API_BASE_URL}${path}`, init)
  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }
  return { response, body }
}

export const isApiReachable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${E2E_API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(2_000),
    })
    return response.ok
  } catch {
    return false
  }
}

export const uniqueEmail = (label: string) =>
  `e2e-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`

export const registerUser = async (
  email: string,
  password = E2E_DEFAULT_PASSWORD,
): Promise<void> => {
  const { response, body } = await apiFetch('/api/v1/auth/register', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(`Register failed (${response.status}): ${JSON.stringify(body)}`)
  }
}

export const verifyEmailWithToken = async (token: string): Promise<void> => {
  const { response, body } = await apiFetch('/api/v1/auth/verify-email', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    throw new Error(`Verify email failed (${response.status}): ${JSON.stringify(body)}`)
  }
}

export const loginApi = async (
  email: string,
  password = E2E_DEFAULT_PASSWORD,
): Promise<TokenPair> => {
  const { response, body } = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error(`Login failed (${response.status}): ${JSON.stringify(body)}`)
  }
  return body as TokenPair
}

export const createVerifiedUser = async (
  label: string,
  password = E2E_DEFAULT_PASSWORD,
): Promise<{ email: string; password: string; tokens: TokenPair }> => {
  const email = uniqueEmail(label)
  await registerUser(email, password)
  const token = await waitForEmailToken({
    to: email,
    subjectIncludes: 'Verify',
  })
  await verifyEmailWithToken(token)
  const tokens = await loginApi(email, password)
  return { email, password, tokens }
}

export const forgotPasswordApi = async (email: string): Promise<void> => {
  const { response, body } = await apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  })
  if (!response.ok) {
    throw new Error(`Forgot password failed (${response.status}): ${JSON.stringify(body)}`)
  }
}

export const resetPasswordApi = async (token: string, password: string): Promise<void> => {
  const { response, body } = await apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ token, password }),
  })
  if (!response.ok) {
    throw new Error(`Reset password failed (${response.status}): ${JSON.stringify(body)}`)
  }
}

export const createPublishedTrip = async (
  accessToken: string,
  overrides: Record<string, unknown> = {},
): Promise<TripDetail> => {
  const create = await apiFetch('/api/v1/trips', {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      name: 'E2E Tokyo',
      destination: 'Tokyo',
      description: 'Automation trip',
      start_date: '2027-04-01',
      end_date: '2027-04-05',
      pace: 'balanced',
      visibility: 'private',
      ...overrides,
    }),
  })
  if (!create.response.ok) {
    throw new Error(
      `Create trip failed (${create.response.status}): ${JSON.stringify(create.body)}`,
    )
  }
  const trip = create.body as TripDetail
  const publish = await apiFetch(`/api/v1/trips/${trip.id}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!publish.response.ok) {
    throw new Error(
      `Publish trip failed (${publish.response.status}): ${JSON.stringify(publish.body)}`,
    )
  }
  return publish.body as TripDetail
}

export const addTripMember = async (
  accessToken: string,
  tripId: string,
  email: string,
): Promise<void> => {
  const { response, body } = await apiFetch(`/api/v1/trips/${tripId}/members`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ email }),
  })
  if (!response.ok) {
    throw new Error(`Add member failed (${response.status}): ${JSON.stringify(body)}`)
  }
}

export const createDraftTrip = async (
  accessToken: string,
  overrides: Record<string, unknown> = {},
): Promise<TripDetail> => {
  const create = await apiFetch('/api/v1/trips', {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      name: 'Draft trip',
      destination: 'Somewhere',
      start_date: '2027-06-01',
      end_date: '2027-06-03',
      pace: 'balanced',
      visibility: 'private',
      ...overrides,
    }),
  })
  if (!create.response.ok) {
    throw new Error(
      `Create draft failed (${create.response.status}): ${JSON.stringify(create.body)}`,
    )
  }
  return create.body as TripDetail
}

export const createActivityApi = async (
  accessToken: string,
  tripId: string,
  overrides: Record<string, unknown> = {},
) => {
  const { response, body } = await apiFetch(`/api/v1/trips/${tripId}/activities`, {
    method: 'POST',
    headers: { ...jsonHeaders, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      title: 'Temple walk',
      activity_date: '2027-04-02',
      activity_type: 'explore',
      start_minute: 600,
      end_minute: 720,
      note: '',
      ...overrides,
    }),
  })
  if (!response.ok) {
    throw new Error(`Create activity failed (${response.status}): ${JSON.stringify(body)}`)
  }
  return body as { id: string; title: string }
}

export const softDeleteTripApi = async (accessToken: string, tripId: string) => {
  const { response, body } = await apiFetch(`/api/v1/trips/${tripId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    throw new Error(`Delete trip failed (${response.status}): ${JSON.stringify(body)}`)
  }
}
