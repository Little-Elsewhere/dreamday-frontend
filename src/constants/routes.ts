export const ROUTES = {
  PUBLIC: {
    ROOT: '/',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REGISTER_SUCCESS: '/auth/register/success',
      CONFIRM: '/auth/confirm',
      ERROR: '/auth/error',
      UPDATE_PASSWORD: '/auth/update-password',
    },
  },
  PRIVATE: {
    ACCOUNT: '/account',
  },
} as const
