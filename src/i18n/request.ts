import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import * as rootParams from 'next/root-params'
import { notFound } from 'next/navigation'
import { routing } from './routing'

export default getRequestConfig(async () => {
  const requested = await rootParams.locale()

  if (!hasLocale(routing.locales, requested)) {
    notFound()
  }

  const locale = requested

  return {
    locale,
    messages: {
      common: (await import(`../../messages/${locale}/common.json`)).default,
      page: (await import(`../../messages/${locale}/page.json`)).default,
      offline: (await import(`../../messages/${locale}/offline.json`)).default,
      error: (await import(`../../messages/${locale}/error.json`)).default,
    },
  }
})
