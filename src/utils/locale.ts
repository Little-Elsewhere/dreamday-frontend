import { routing } from '@/i18n/routing'

export const getLocaleFromPathname = (pathname: string): (typeof routing.locales)[number] => {
  const localeSegment = pathname.split('/')[1]

  return routing.locales.find((locale) => locale === localeSegment) ?? routing.defaultLocale
}

export const removeLocalePrefix = (pathname: string): string =>
  pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
