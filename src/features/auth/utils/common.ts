import { clientEnv } from '@/env/client'
import { ROUTES } from '@/constants/routes'
import { routing } from '@/i18n/routing'
import { ActionErrorKind } from '@/types/action-result'

type UrlOptions = {
  queryParams?: URLSearchParams
  fullUrl?: boolean
  includeLocale?: boolean
}

export function generateLocalizedUrl(
  locale: string,
  pathname: string,
  options: UrlOptions = {},
): string {
  const validLocale = routing.locales.find((candidate) => candidate === locale)
  if (!validLocale) throw new Error('Unsupported locale')

  const path = options.includeLocale ? `/${validLocale}${pathname}` : pathname
  const url = new URL(path, clientEnv.NEXT_PUBLIC_APP_URL)

  if (options.queryParams) {
    url.search = options.queryParams.toString()
  }

  return options.fullUrl ? url.toString() : `${url.pathname}${url.search}${url.hash}`
}

export const getAuthSystemErrorUrl = (locale: string): string =>
  generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.ERROR, {
    queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
  })
