import { afterEach, describe, expect, it, vi } from 'vitest'

import { API_ROUTES } from '@/constants/api-routes'
import {
  readProxyAuthCookies,
  refreshTokensWithBaseUrl,
} from '@/features/auth/actions/refresh-on-proxy'
import { AUTH_COOKIE } from '@/features/auth/constants/session'

const tokenResponse = {
  access_token: 'access-token',
  token_type: 'bearer' as const,
  expires_in: 900,
  refresh_token: 'refresh-token',
  refresh_expires_in: 604_800,
}

describe('refreshTokensWithBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts the refresh token and returns a parsed token payload', async () => {
    const fetchMock = vi.fn(async () => Response.json(tokenResponse, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(refreshTokensWithBaseUrl('http://api.example', 'old-refresh')).resolves.toEqual(
      tokenResponse,
    )

    expect(fetchMock).toHaveBeenCalledWith(`http://api.example${API_ROUTES.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: 'old-refresh' }),
      cache: 'no-store',
    })
  })

  it('returns null when the refresh response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 401 })),
    )

    await expect(refreshTokensWithBaseUrl('http://api.example', 'old-refresh')).resolves.toBeNull()
  })

  it('returns null when the refresh payload fails schema validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ access_token: '' }, { status: 200 })),
    )

    await expect(refreshTokensWithBaseUrl('http://api.example', 'old-refresh')).resolves.toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )

    await expect(refreshTokensWithBaseUrl('http://api.example', 'old-refresh')).resolves.toBeNull()
  })
})

describe('readProxyAuthCookies', () => {
  it('reads access and refresh cookies from a cookie header store', () => {
    const cookies = {
      get: (name: string) => {
        if (name === AUTH_COOKIE.ACCESS_TOKEN) return { value: 'access-token' }
        if (name === AUTH_COOKIE.REFRESH_TOKEN) return { value: 'refresh-token' }
        return undefined
      },
    }

    expect(readProxyAuthCookies(cookies)).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })

  it('returns undefined values when cookies are absent', () => {
    expect(readProxyAuthCookies({ get: () => undefined })).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
    })
  })
})
