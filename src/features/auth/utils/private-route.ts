import { ROUTES } from '@/constants/routes'

export const isPrivateRoute = (pathname: string): boolean => {
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

  return Object.values(ROUTES.PRIVATE).some(
    (privatePathname) =>
      pathnameWithoutLocale === privatePathname ||
      pathnameWithoutLocale.startsWith(`${privatePathname}/`),
  )
}
