import type { Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { clientEnv } from '@/env/client'
import { routing } from '@/i18n/routing'
import { ActionErrorKind } from '@/types/action-result'

type UrlOptions = {
  locale?: Locale
  queryParams?: URLSearchParams
  fullUrl?: boolean
}

export const generateLocalizedUrl = (pathname: string, options: UrlOptions = {}): string => {
  let path = pathname

  if (options.locale) {
    const validLocale = routing.locales.find((candidate) => candidate === options.locale)
    if (!validLocale) throw new Error('Unsupported locale')
    path = `/${validLocale}${pathname}`
  }

  const url = new URL(path, clientEnv.NEXT_PUBLIC_APP_URL)

  if (options.queryParams) {
    url.search = options.queryParams.toString()
  }

  return options.fullUrl ? url.toString() : `${url.pathname}${url.search}${url.hash}`
}

export const getAuthSystemErrorUrl = (): string =>
  generateLocalizedUrl(ROUTES.PUBLIC.AUTH.ERROR, {
    queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
  })
