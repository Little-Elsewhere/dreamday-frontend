import { API_ROUTES } from '@/constants/api-routes'
import { AUTH_COOKIE } from '@/features/auth/constants/session'
import { type TokenResponse, tokenResponseSchema } from '@/features/auth/schemas/api'

export const refreshTokensWithBaseUrl = async (
  apiBaseUrl: string,
  refreshToken: string,
): Promise<TokenResponse | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}${API_ROUTES.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) return null

    const payload: unknown = await response.json()
    return tokenResponseSchema.parse(payload)
  } catch {
    return null
  }
}

export const readProxyAuthCookies = (cookieHeader: {
  get: (name: string) => { value: string } | undefined
}) => ({
  accessToken: cookieHeader.get(AUTH_COOKIE.ACCESS_TOKEN)?.value,
  refreshToken: cookieHeader.get(AUTH_COOKIE.REFRESH_TOKEN)?.value,
})
