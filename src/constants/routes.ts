import { TRIP_DETAIL_PATH } from '@/constants/patterns'

export const ROUTES = {
  PUBLIC: {
    ROOT: '/',
    MAINTENANCE: '/maintenance',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REGISTER_SUCCESS: '/auth/register/success',
      RECOVERY_SUCCESS: '/auth/recovery/success',
      CONFIRM: '/auth/confirm',
      RESET_PASSWORD: '/auth/reset-password',
      ERROR: '/auth/error',
    },
  },
  PRIVATE: {
    ACCOUNT: '/account',
    TRIPS: '/trips',
    TRIP_DETAIL: Object.assign((tripId: string) => `/trips/${tripId}`, {
      pattern: TRIP_DETAIL_PATH,
    }),
    TRIP_CREATE: '/trips/create',
    TRIP_EDIT: Object.assign((tripId: string) => `/trips/${tripId}/edit`, {
      pattern: /^\/trips\/[^/]+\/edit$/,
    }),
    UPDATE_PASSWORD: '/auth/update-password',
  },
} as const
