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
      ERROR: '/auth/error',
    },
  },
  PRIVATE: {
    ACCOUNT: '/account',
    TRIPS: '/trips',
    TRIP_DETAIL: Object.assign((tripId: string) => `/trips/${tripId}`, {
      pattern: /^\/trips\/[^/]+$/,
    }),
    TRIP_CREATE: '/trips/create',
    UPDATE_PASSWORD: '/auth/update-password',
  },
} as const
