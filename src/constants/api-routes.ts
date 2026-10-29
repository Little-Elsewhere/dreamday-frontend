const API_V1 = '/api/v1'

export const API_ROUTES = {
  AUTH: {
    REGISTER: `${API_V1}/auth/register`,
    RESEND_VERIFICATION: `${API_V1}/auth/resend-verification`,
    VERIFY_EMAIL: `${API_V1}/auth/verify-email`,
    LOGIN: `${API_V1}/auth/login`,
    FORGOT_PASSWORD: `${API_V1}/auth/forgot-password`,
    RESET_PASSWORD: `${API_V1}/auth/reset-password`,
    UPDATE_PASSWORD: `${API_V1}/auth/update-password`,
    REFRESH: `${API_V1}/auth/refresh`,
    LOGOUT: `${API_V1}/auth/logout`,
    ME: `${API_V1}/auth/me`,
  },
} as const
