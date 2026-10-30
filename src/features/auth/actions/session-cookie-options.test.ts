import { afterEach, describe, expect, it, vi } from 'vitest'

describe('authCookieOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('sets secure cookies in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { authCookieOptions } = await import('@/features/auth/actions/session-cookie-options')

    expect(authCookieOptions(900)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    })
  })

  it('keeps cookies insecure outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    const { authCookieOptions } = await import('@/features/auth/actions/session-cookie-options')

    expect(authCookieOptions(604_800).secure).toBe(false)
  })
})
