import 'server-only'

import { cookies } from 'next/headers'

import { API_ROUTES } from '@/constants/api-routes'
import { authCookieOptions } from '@/features/auth/actions/session-cookie-options'
import { AUTH_COOKIE } from '@/features/auth/constants/session'
import {
  type TokenResponse,
  tokenResponseSchema,
  type UserResponse,
  userResponseSchema,
} from '@/features/auth/schemas/api'
import { get, post } from '@/utils/api-client'

export const getAccessToken = async () => {
  const jar = await cookies()
  return jar.get(AUTH_COOKIE.ACCESS_TOKEN)?.value
}

export const getRefreshToken = async () => {
  const jar = await cookies()
  return jar.get(AUTH_COOKIE.REFRESH_TOKEN)?.value
}

export const setSessionTokens = async (tokens: TokenResponse) => {
  const jar = await cookies()
  jar.set(AUTH_COOKIE.ACCESS_TOKEN, tokens.access_token, authCookieOptions(tokens.expires_in))
  jar.set(
    AUTH_COOKIE.REFRESH_TOKEN,
    tokens.refresh_token,
    authCookieOptions(tokens.refresh_expires_in),
  )
}

export const clearSessionTokens = async () => {
  const jar = await cookies()
  jar.delete(AUTH_COOKIE.ACCESS_TOKEN)
  jar.delete(AUTH_COOKIE.REFRESH_TOKEN)
}

export const refreshSessionTokens = async (): Promise<TokenResponse | null> => {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const result = await post<TokenResponse>(API_ROUTES.AUTH.REFRESH, tokenResponseSchema, {
    body: { refresh_token: refreshToken },
  })
  if (!result.ok) {
    await clearSessionTokens()
    return null
  }

  await setSessionTokens(result.data)
  return result.data
}

export const getCurrentUser = async (): Promise<UserResponse | null> => {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  const result = await get<UserResponse>(API_ROUTES.AUTH.ME, userResponseSchema, {
    accessToken,
  })
  return result.ok ? result.data : null
}
