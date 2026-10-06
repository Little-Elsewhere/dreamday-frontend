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
    CREATE_TRIP: '/trips/new',
    UPDATE_PASSWORD: '/auth/update-password',
  },
} as const
