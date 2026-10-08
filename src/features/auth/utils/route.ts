import { ROUTES } from '@/constants/routes'
import { removeLocalePrefix } from '@/utils/locale'

export const isPrivateRoute = (pathname: string): boolean => {
  const pathnameWithoutLocale = removeLocalePrefix(pathname)

  return Object.values(ROUTES.PRIVATE).some((privateRoute) => {
    if (typeof privateRoute === 'function') {
      return privateRoute.pattern.test(pathnameWithoutLocale)
    }

    return (
      pathnameWithoutLocale === privateRoute || pathnameWithoutLocale.startsWith(`${privateRoute}/`)
    )
  })
}

export const isLoginRoute = (pathname: string): boolean =>
  removeLocalePrefix(pathname) === ROUTES.PUBLIC.AUTH.LOGIN
