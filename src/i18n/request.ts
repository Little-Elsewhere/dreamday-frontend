import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async () => {
  const requested = await rootParams.locale()

  if (!hasLocale(routing.locales, requested)) {
    notFound()
  }

  const locale = requested
  const [
    commonFooter,
    account,
    login,
    register,
    recovery,
    updatePassword,
    authCommon,
    authError,
    commonError,
    commonOffline,
    commonMaintenance,
    tripsCommon,
    tripsList,
    tripsCreate,
    tripsDetail,
  ] = await Promise.all([
    import(`@messages/${locale}/common/footer.json`),
    import(`@messages/${locale}/account.json`),
    import(`@messages/${locale}/auth/login.json`),
    import(`@messages/${locale}/auth/register.json`),
    import(`@messages/${locale}/auth/recovery.json`),
    import(`@messages/${locale}/auth/update-password.json`),
    import(`@messages/${locale}/auth/common.json`),
    import(`@messages/${locale}/auth/error.json`),
    import(`@messages/${locale}/common/error.json`),
    import(`@messages/${locale}/common/offline.json`),
    import(`@messages/${locale}/common/maintenance.json`),
    import(`@messages/${locale}/trips/common.json`),
    import(`@messages/${locale}/trips/list.json`),
    import(`@messages/${locale}/trips/create.json`),
    import(`@messages/${locale}/trips/detail.json`),
  ])

  return {
    locale,
    messages: {
      common: {
        footer: commonFooter.default,
        error: commonError.default,
        offline: commonOffline.default,
        maintenance: commonMaintenance.default,
      },
      account: account.default,
      auth: {
        login: login.default,
        register: register.default,
        recovery: recovery.default,
        updatePassword: updatePassword.default,
        common: authCommon.default,
        error: authError.default,
      },
      trips: {
        ...tripsCommon.default,
        list: tripsList.default,
        create: tripsCreate.default,
        detail: tripsDetail.default,
      },
    },
  }
})
