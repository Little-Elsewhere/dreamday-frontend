import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getAccessToken = vi.fn()
const refreshSessionTokens = vi.fn()

vi.mock('@/features/auth/actions/session', () => ({
  getAccessToken: () => getAccessToken(),
  refreshSessionTokens: () => refreshSessionTokens(),
}))

vi.mock('@/env/server', () => ({
  serverEnv: {
    API_BASE_URL: 'http://backend.test',
  },
}))

describe('trip cover proxy route', () => {
  beforeEach(() => {
    getAccessToken.mockReset()
    refreshSessionTokens.mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('forwards the session bearer token and streams upstream bytes', async () => {
    getAccessToken.mockResolvedValue('access-token')
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )

    const { GET } = await import('./route')
    const response = await GET(new Request('http://dreamday.local/api/trips/t1/cover'), {
      params: Promise.resolve({ tripId: 't1' }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/api/v1/trips/t1/cover',
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.any(Headers),
      }),
    )
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer access-token')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toBe('private, max-age=60')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(Buffer.from([1, 2, 3]))
  })

  it('retries once after refreshing when the upstream returns 401', async () => {
    getAccessToken.mockResolvedValue('stale-token')
    refreshSessionTokens.mockResolvedValue({ access_token: 'fresh-token' })
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 })).mockResolvedValueOnce(
      new Response(new Uint8Array([9]), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }),
    )

    const { GET } = await import('./route')
    const response = await GET(new Request('http://dreamday.local/api/trips/t2/cover'), {
      params: Promise.resolve({ tripId: 't2' }),
    })

    expect(refreshSessionTokens).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const retryHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Headers
    expect(retryHeaders.get('Authorization')).toBe('Bearer fresh-token')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
  })

  it('allows an unauthenticated upstream call for public covers', async () => {
    getAccessToken.mockResolvedValue(undefined)
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([4]), {
        status: 200,
        headers: { 'Content-Type': 'image/webp' },
      }),
    )

    const { GET } = await import('./route')
    const response = await GET(new Request('http://dreamday.local/api/trips/t3/cover'), {
      params: Promise.resolve({ tripId: 't3' }),
    })

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.has('Authorization')).toBe(false)
    expect(response.status).toBe(200)
  })

  it('propagates non-OK upstream status without a body', async () => {
    getAccessToken.mockResolvedValue('access-token')
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

    const { GET } = await import('./route')
    const response = await GET(new Request('http://dreamday.local/api/trips/t4/cover'), {
      params: Promise.resolve({ tripId: 't4' }),
    })

    expect(response.status).toBe(404)
    expect(await response.arrayBuffer()).toHaveProperty('byteLength', 0)
  })
})
