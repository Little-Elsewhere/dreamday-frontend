import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { removeLocalePrefix } from '@/utils/locale'

export const isPrivateRoute = (pathname: string): boolean => {
  const pathnameWithoutLocale = removeLocalePrefix(pathname)

  return Object.values(ROUTES.PRIVATE).some(
    (privatePathname) =>
      pathnameWithoutLocale === privatePathname ||
      pathnameWithoutLocale.startsWith(`${privatePathname}/`),
  )
}

export const isLoginRoute = (pathname: string): boolean =>
  removeLocalePrefix(pathname) === ROUTES.PUBLIC.AUTH.LOGIN

export const getRedirectPathname = (pathname: string) =>
  serverEnv.NEXT_PUBLIC_APP_URL.concat(pathname)
