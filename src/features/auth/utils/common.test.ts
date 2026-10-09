import { describe, expect, it, vi } from 'vitest'

import { Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { generateLocalizedUrl, getAuthSystemErrorUrl } from '@/features/auth/utils/common'
import { ActionErrorKind } from '@/types/action-result'

vi.mock('@/env/client', () => ({
  clientEnv: { NEXT_PUBLIC_APP_URL: 'https://dreamday.example' },
}))

describe('generateLocalizedUrl', () => {
  it('returns a relative URL without a locale when none is provided', () => {
    expect(generateLocalizedUrl(ROUTES.PRIVATE.ACCOUNT)).toBe('/account')
  })

  it('includes the locale when one is provided', () => {
    expect(generateLocalizedUrl(ROUTES.PRIVATE.ACCOUNT, { locale: Locale.VI })).toBe('/vi/account')
  })

  it('adds encoded query parameters to the path', () => {
    const queryParams = new URLSearchParams({ destination: 'Ha Noi', page: '2' })

    expect(generateLocalizedUrl(ROUTES.PRIVATE.TRIPS, { queryParams })).toBe(
      '/trips?destination=Ha+Noi&page=2',
    )
  })

  it('includes the locale and query parameters in a relative URL', () => {
    const queryParams = new URLSearchParams({ destination: 'Ha Noi', page: '2' })

    expect(generateLocalizedUrl(ROUTES.PRIVATE.TRIPS, { locale: Locale.VI, queryParams })).toBe(
      '/vi/trips?destination=Ha+Noi&page=2',
    )
  })

  it('returns the full URL without a locale when only fullUrl is requested', () => {
    expect(generateLocalizedUrl(ROUTES.PRIVATE.ACCOUNT, { fullUrl: true })).toBe(
      'https://dreamday.example/account',
    )
  })

  it('includes query parameters in a full URL without a locale', () => {
    const queryParams = new URLSearchParams({ destination: 'Ha Noi', page: '2' })

    expect(generateLocalizedUrl(ROUTES.PRIVATE.TRIPS, { queryParams, fullUrl: true })).toBe(
      'https://dreamday.example/trips?destination=Ha+Noi&page=2',
    )
  })

  it('includes the provided locale in a full URL', () => {
    expect(generateLocalizedUrl(ROUTES.PRIVATE.ACCOUNT, { locale: Locale.EN, fullUrl: true })).toBe(
      'https://dreamday.example/en/account',
    )
  })

  it('applies all URL options together', () => {
    const queryParams = new URLSearchParams({ destination: 'Ha Noi', page: '2' })

    expect(
      generateLocalizedUrl(ROUTES.PRIVATE.TRIPS, {
        locale: Locale.VI,
        queryParams,
        fullUrl: true,
      }),
    ).toBe('https://dreamday.example/vi/trips?destination=Ha+Noi&page=2')
  })
})

describe('getAuthSystemErrorUrl', () => {
  it('returns the auth error path with the system error type', () => {
    expect(getAuthSystemErrorUrl()).toBe(`/auth/error?type=${ActionErrorKind.System}`)
  })
})
