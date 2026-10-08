import { LOCALES } from '@/constants/locale'

export const getPathnameLocale = (pathname: string) => {
  const localeSegment = pathname.split('/')[1]

  return LOCALES.find((locale) => locale === localeSegment)
}

export const removeLocalePrefix = (pathname: string): string => {
  const locale = getPathnameLocale(pathname)

  if (!locale) return pathname
  return pathname.slice(locale.length + 1) || '/'
}
