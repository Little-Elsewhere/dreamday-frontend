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
  const [common, page, login, register, recovery, updatePassword, authCommon, offline, error] =
    await Promise.all([
      import(`../../messages/${locale}/common.json`),
      import(`../../messages/${locale}/page.json`),
      import(`../../messages/${locale}/auth/login.json`),
      import(`../../messages/${locale}/auth/register.json`),
      import(`../../messages/${locale}/auth/recovery.json`),
      import(`../../messages/${locale}/auth/update-password.json`),
      import(`../../messages/${locale}/auth/common.json`),
      import(`../../messages/${locale}/offline.json`),
      import(`../../messages/${locale}/error.json`),
    ])

  return {
    locale,
    messages: {
      common: common.default,
      page: page.default,
      auth: {
        login: login.default,
        register: register.default,
        recovery: recovery.default,
        updatePassword: updatePassword.default,
        common: authCommon.default,
      },
      offline: offline.default,
      error: error.default,
    },
  }
})
