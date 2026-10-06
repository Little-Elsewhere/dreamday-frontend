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
    tripsCommon,
    tripsList,
    tripsTrip,
    tripsSchedule,
    tripsChecklists,
    tripsMembers,
    tripsInvitation,
    tripsFund,
    tripsErrors,
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
    import(`@messages/${locale}/trips/common.json`),
    import(`@messages/${locale}/trips/list.json`),
    import(`@messages/${locale}/trips/trip.json`),
    import(`@messages/${locale}/trips/schedule.json`),
    import(`@messages/${locale}/trips/checklists.json`),
    import(`@messages/${locale}/trips/members.json`),
    import(`@messages/${locale}/trips/invitation.json`),
    import(`@messages/${locale}/trips/fund.json`),
    import(`@messages/${locale}/trips/errors.json`),
  ])

  return {
    locale,
    messages: {
      common: {
        footer: commonFooter.default,
        error: commonError.default,
        offline: commonOffline.default,
      },
      account: account.default,
      trips: {
        common: tripsCommon.default,
        list: tripsList.default,
        trip: tripsTrip.default,
        schedule: tripsSchedule.default,
        checklists: tripsChecklists.default,
        members: tripsMembers.default,
        invitation: tripsInvitation.default,
        fund: tripsFund.default,
        errors: tripsErrors.default,
      },
      auth: {
        login: login.default,
        register: register.default,
        recovery: recovery.default,
        updatePassword: updatePassword.default,
        common: authCommon.default,
        error: authError.default,
      },
    },
  }
})
