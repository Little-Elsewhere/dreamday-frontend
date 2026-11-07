import { NextResponse } from 'next/server'

import { API_ROUTES } from '@/constants/api-routes'
import { serverEnv } from '@/env/server'
import { getAccessToken, refreshSessionTokens } from '@/features/auth/actions/session'

type Params = { params: Promise<{ tripId: string }> }

const fetchCover = async (tripId: string, accessToken: string | undefined) => {
  const headers = new Headers({ Accept: '*/*' })
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return fetch(`${serverEnv.API_BASE_URL}${API_ROUTES.TRIPS.COVER(tripId)}`, {
    headers,
    cache: 'no-store',
  })
}

export const GET = async (_request: Request, { params }: Params) => {
  const { tripId } = await params
  let accessToken = await getAccessToken()
  let upstream = await fetchCover(tripId, accessToken)

  if (upstream.status === 401) {
    const tokens = await refreshSessionTokens()
    accessToken = tokens?.access_token
    if (accessToken) {
      upstream = await fetchCover(tripId, accessToken)
    }
  }

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status })
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const body = await upstream.arrayBuffer()
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=60',
    },
  })
}
