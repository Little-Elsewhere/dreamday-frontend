import { DEFAULT_LOCALE, LOCALES } from '@/constants/locale'

export const getLocaleFromPathname = (pathname: string): (typeof LOCALES)[number] => {
  const localeSegment = pathname.split('/')[1]

  return LOCALES.find((locale) => locale === localeSegment) ?? DEFAULT_LOCALE
}

export const removeLocalePrefix = (pathname: string): string => {
  const localeSegment = pathname.split('/')[1]
  const locale = LOCALES.find((candidate) => candidate === localeSegment)

  if (!locale) return pathname
  return pathname.slice(locale.length + 1) || '/'
}
