import enAccount from '../../messages/en/account.json'
import enAuthCommon from '../../messages/en/auth/common.json'
import enConfirm from '../../messages/en/auth/confirm.json'
import enError from '../../messages/en/auth/error.json'
import enLogin from '../../messages/en/auth/login.json'
import enRecovery from '../../messages/en/auth/recovery.json'
import enRegister from '../../messages/en/auth/register.json'
import enResetPassword from '../../messages/en/auth/reset-password.json'
import enUpdatePassword from '../../messages/en/auth/update-password.json'
import enMaintenance from '../../messages/en/common/maintenance.json'
import enOffline from '../../messages/en/common/offline.json'
import enTripsCreate from '../../messages/en/trips/create.json'
import enTripsDetail from '../../messages/en/trips/detail.json'
import enTripsList from '../../messages/en/trips/list.json'
import viAccount from '../../messages/vi/account.json'
import viAuthCommon from '../../messages/vi/auth/common.json'
import viConfirm from '../../messages/vi/auth/confirm.json'
import viError from '../../messages/vi/auth/error.json'
import viLogin from '../../messages/vi/auth/login.json'
import viRecovery from '../../messages/vi/auth/recovery.json'
import viRegister from '../../messages/vi/auth/register.json'
import viResetPassword from '../../messages/vi/auth/reset-password.json'
import viUpdatePassword from '../../messages/vi/auth/update-password.json'
import viMaintenance from '../../messages/vi/common/maintenance.json'
import viOffline from '../../messages/vi/common/offline.json'
import viTripsCreate from '../../messages/vi/trips/create.json'
import viTripsDetail from '../../messages/vi/trips/detail.json'
import viTripsList from '../../messages/vi/trips/list.json'
import { LOCALES } from '../../src/constants/locale'

export type E2eLocale = (typeof LOCALES)[number]

export const e2eLocales = LOCALES

const catalogs = {
  en: {
    account: enAccount,
    auth: {
      common: enAuthCommon,
      confirm: enConfirm,
      error: enError,
      login: enLogin,
      recovery: enRecovery,
      register: enRegister,
      resetPassword: enResetPassword,
      updatePassword: enUpdatePassword,
    },
    maintenance: enMaintenance,
    offline: enOffline,
    trips: {
      create: enTripsCreate,
      detail: enTripsDetail,
      list: enTripsList,
    },
  },
  vi: {
    account: viAccount,
    auth: {
      common: viAuthCommon,
      confirm: viConfirm,
      error: viError,
      login: viLogin,
      recovery: viRecovery,
      register: viRegister,
      resetPassword: viResetPassword,
      updatePassword: viUpdatePassword,
    },
    maintenance: viMaintenance,
    offline: viOffline,
    trips: {
      create: viTripsCreate,
      detail: viTripsDetail,
      list: viTripsList,
    },
  },
} as const

export const m = (locale: E2eLocale) => catalogs[locale]

/** Replace simple `{name}`-style placeholders used in message catalogs. */
export const fillMessage = (template: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template)
