import type { AuthError } from '@supabase/supabase-js'
import { AuthErrorCode, AuthErrorName } from '@/features/auth/constants/auth'

export const isMissingSession = (error: AuthError): boolean =>
  error.name === AuthErrorName.SessionMissing ||
  error.name === AuthErrorName.InvalidJwt ||
  error.code === AuthErrorCode.SessionNotFound ||
  error.code === AuthErrorCode.SessionExpired ||
  error.code === AuthErrorCode.RefreshTokenNotFound
