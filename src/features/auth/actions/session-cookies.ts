import type { NextResponse } from 'next/server'

import { authCookieOptions } from '@/features/auth/actions/session-cookie-options'
import { AUTH_COOKIE } from '@/features/auth/constants/session'
import type { TokenResponse } from '@/features/auth/schemas/api'

export const applySessionTokensToResponse = (response: NextResponse, tokens: TokenResponse) => {
  response.cookies.set(
    AUTH_COOKIE.ACCESS_TOKEN,
    tokens.access_token,
    authCookieOptions(tokens.expires_in),
  )
  response.cookies.set(
    AUTH_COOKIE.REFRESH_TOKEN,
    tokens.refresh_token,
    authCookieOptions(tokens.refresh_expires_in),
  )
}

export const clearSessionTokensOnResponse = (response: NextResponse) => {
  response.cookies.delete(AUTH_COOKIE.ACCESS_TOKEN)
  response.cookies.delete(AUTH_COOKIE.REFRESH_TOKEN)
}
