import { describe, expect, it } from 'vitest'

import { Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { isLoginRoute, isPrivateRoute } from '@/features/auth/utils/route'

describe('isPrivateRoute', () => {
  it.each([
    ['account route', ROUTES.PRIVATE.ACCOUNT],
    ['nested account route', `${ROUTES.PRIVATE.ACCOUNT}/settings`],
    ['trips route', ROUTES.PRIVATE.TRIPS],
    ['trip create route', ROUTES.PRIVATE.TRIP_CREATE],
    ['trip detail route', ROUTES.PRIVATE.TRIP_DETAIL('trip-123')],
    ['localized route', `/${Locale.VI}${ROUTES.PRIVATE.ACCOUNT}`],
  ])('returns true for a %s', (_description, pathname) => {
    expect(isPrivateRoute(pathname)).toBe(true)
  })

  it.each([ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.AUTH.LOGIN, '/tripster', '/public/account'])(
    'returns false for public or unrelated route %s',
    (pathname) => {
      expect(isPrivateRoute(pathname)).toBe(false)
    },
  )
})

describe('isLoginRoute', () => {
  it.each([ROUTES.PUBLIC.AUTH.LOGIN, `/${Locale.VI}${ROUTES.PUBLIC.AUTH.LOGIN}`])(
    'returns true for the login route %s',
    (pathname) => {
      expect(isLoginRoute(pathname)).toBe(true)
    },
  )

  it.each([ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.AUTH.REGISTER, `${ROUTES.PUBLIC.AUTH.LOGIN}/nested`])(
    'returns false for a non-login route %s',
    (pathname) => {
      expect(isLoginRoute(pathname)).toBe(false)
    },
  )
})
