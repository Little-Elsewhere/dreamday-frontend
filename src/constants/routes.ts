export const ROUTES = {
  PUBLIC: {
    ROOT: '/',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      CONFIRM: '/auth/confirm',
      UPDATE_PASSWORD: '/auth/update-password',
    },
  },
  PRIVATE: {
    ACCOUNT: '/account',
  },
} as const
