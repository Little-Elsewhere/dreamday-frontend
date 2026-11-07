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
  TRIPS: {
    LIST: `${API_V1}/trips`,
    DELETED: `${API_V1}/trips/deleted`,
    DRAFT: `${API_V1}/trips/draft`,
    DETAIL: (tripId: string) => `${API_V1}/trips/${tripId}`,
    PUBLISH: (tripId: string) => `${API_V1}/trips/${tripId}/publish`,
    RESTORE: (tripId: string) => `${API_V1}/trips/${tripId}/restore`,
    COVER: (tripId: string) => `${API_V1}/trips/${tripId}/cover`,
    MEMBERS: (tripId: string) => `${API_V1}/trips/${tripId}/members`,
    MEMBER: (tripId: string, userId: string) => `${API_V1}/trips/${tripId}/members/${userId}`,
    ACTIVITIES: (tripId: string) => `${API_V1}/trips/${tripId}/activities`,
    ACTIVITY: (tripId: string, activityId: string) =>
      `${API_V1}/trips/${tripId}/activities/${activityId}`,
    ACTIVITY_RESTORE: (tripId: string, activityId: string) =>
      `${API_V1}/trips/${tripId}/activities/${activityId}/restore`,
  },
} as const
