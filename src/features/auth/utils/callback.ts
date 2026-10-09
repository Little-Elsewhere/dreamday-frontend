import { type Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { getPathnameLocale, removeLocalePrefix } from '@/utils/locale'

export const getConfirmationRedirect = (
  appUrl: string,
  fallbackLocale: Locale,
  next?: string,
): { href: string; locale: Locale } => {
  const fallback = { href: ROUTES.PUBLIC.ROOT, locale: fallbackLocale }
  if (!next) return fallback

  try {
    const appOrigin = new URL(appUrl).origin
    const target = new URL(next, appOrigin)
    if (target.origin !== appOrigin) return fallback

    const locale = getPathnameLocale(target.pathname) ?? fallbackLocale
    const pathname = removeLocalePrefix(target.pathname)

    return { href: `${pathname}${target.search}${target.hash}`, locale }
  } catch {
    return fallback
  }
}
