export const ROUTES = {
  PUBLIC: {
    ROOT: '/',
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
    TRIP_CREATE: '/trips/create',
    UPDATE_PASSWORD: '/auth/update-password',
  },
} as const

export const getTripDetailRoute = (tripId: string): string => `${ROUTES.PRIVATE.TRIPS}/${tripId}`
