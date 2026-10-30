import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ROUTES } from '@/constants/api-routes'
import { AUTH_COOKIE } from '@/features/auth/constants/session'
import { tokenResponseSchema, userResponseSchema } from '@/features/auth/schemas/api'

vi.mock('server-only', () => ({}))

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}

const get = vi.fn()
const post = vi.fn()

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}))

vi.mock('@/utils/api-client', () => ({
  get: (...args: unknown[]) => Reflect.apply(get, undefined, args),
  post: (...args: unknown[]) => Reflect.apply(post, undefined, args),
}))

const {
  clearSessionTokens,
  getAccessToken,
  getCurrentUser,
  getRefreshToken,
  refreshSessionTokens,
  setSessionTokens,
} = await import('@/features/auth/actions/session')

const tokenResponse = {
  access_token: 'access-token',
  token_type: 'bearer' as const,
  expires_in: 900,
  refresh_token: 'refresh-token',
  refresh_expires_in: 604_800,
}

describe('session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookieStore.get.mockReturnValue(undefined)
  })

  it('reads access and refresh tokens from auth cookies', async () => {
    cookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.ACCESS_TOKEN) return { value: 'access-token' }
      if (name === AUTH_COOKIE.REFRESH_TOKEN) return { value: 'refresh-token' }
      return undefined
    })

    await expect(getAccessToken()).resolves.toBe('access-token')
    await expect(getRefreshToken()).resolves.toBe('refresh-token')
  })

  it('returns undefined when auth cookies are missing', async () => {
    await expect(getAccessToken()).resolves.toBeUndefined()
    await expect(getRefreshToken()).resolves.toBeUndefined()
  })

  it('writes access and refresh cookies with the token lifetimes', async () => {
    await setSessionTokens(tokenResponse)

    expect(cookieStore.set).toHaveBeenNthCalledWith(
      1,
      AUTH_COOKIE.ACCESS_TOKEN,
      'access-token',
      expect.objectContaining({ httpOnly: true, path: '/', maxAge: 900 }),
    )
    expect(cookieStore.set).toHaveBeenNthCalledWith(
      2,
      AUTH_COOKIE.REFRESH_TOKEN,
      'refresh-token',
      expect.objectContaining({ httpOnly: true, path: '/', maxAge: 604_800 }),
    )
  })

  it('deletes both auth cookies on clear', async () => {
    await clearSessionTokens()

    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE.ACCESS_TOKEN)
    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE.REFRESH_TOKEN)
  })

  it('returns null from refresh when no refresh cookie exists', async () => {
    await expect(refreshSessionTokens()).resolves.toBeNull()
    expect(post).not.toHaveBeenCalled()
  })

  it('stores rotated tokens after a successful refresh', async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === AUTH_COOKIE.REFRESH_TOKEN ? { value: 'old-refresh' } : undefined,
    )
    post.mockResolvedValue({
      ok: true,
      status: 200,
      data: tokenResponse,
    })

    await expect(refreshSessionTokens()).resolves.toEqual(tokenResponse)
    expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH.REFRESH, tokenResponseSchema, {
      body: { refresh_token: 'old-refresh' },
    })
    expect(cookieStore.set).toHaveBeenCalled()
  })

  it('clears cookies when refresh fails', async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === AUTH_COOKIE.REFRESH_TOKEN ? { value: 'old-refresh' } : undefined,
    )
    post.mockResolvedValue({ ok: false, status: 401 })

    await expect(refreshSessionTokens()).resolves.toBeNull()
    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE.ACCESS_TOKEN)
    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE.REFRESH_TOKEN)
  })

  it('returns null from getCurrentUser when there is no access token', async () => {
    await expect(getCurrentUser()).resolves.toBeNull()
    expect(get).not.toHaveBeenCalled()
  })

  it('returns the parsed user when /me succeeds', async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === AUTH_COOKIE.ACCESS_TOKEN ? { value: 'access-token' } : undefined,
    )
    const user = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      email: 'user@example.com',
      is_email_verified: true,
      created_at: '2026-10-30T02:15:00Z',
    }
    get.mockResolvedValue({ ok: true, status: 200, data: user })

    await expect(getCurrentUser()).resolves.toEqual(user)
    expect(get).toHaveBeenCalledWith(API_ROUTES.AUTH.ME, userResponseSchema, {
      accessToken: 'access-token',
    })
  })

  it('returns null when /me fails', async () => {
    cookieStore.get.mockImplementation((name: string) =>
      name === AUTH_COOKIE.ACCESS_TOKEN ? { value: 'access-token' } : undefined,
    )
    get.mockResolvedValue({ ok: false, status: 401 })

    await expect(getCurrentUser()).resolves.toBeNull()
  })
})
