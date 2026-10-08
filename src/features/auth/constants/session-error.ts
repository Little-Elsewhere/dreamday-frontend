import { AuthErrorCode, AuthErrorName } from '@/features/auth/constants/auth'

export const MISSING_SESSION_ERROR_NAMES: ReadonlySet<string> = new Set([
  AuthErrorName.SessionMissing,
  AuthErrorName.InvalidJwt,
])

export const MISSING_SESSION_ERROR_CODES: ReadonlySet<string> = new Set([
  AuthErrorCode.SessionNotFound,
  AuthErrorCode.SessionExpired,
  AuthErrorCode.RefreshTokenNotFound,
])
