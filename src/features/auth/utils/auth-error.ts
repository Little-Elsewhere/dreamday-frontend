import 'server-only'

import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js'

import { AuthAction, AuthErrorCode, AuthField } from '@/features/auth/constants/auth'
import type { AuthResult } from '@/features/auth/types/auth-result'
import { fieldError, messageError, systemError } from '@/utils/action-result'

const RATE_LIMIT_ERROR_CODES = new Set<string>([
  AuthErrorCode.OverEmailSendRateLimit,
  AuthErrorCode.OverRequestRateLimit,
])
const KNOWN_AUTH_ERROR_CODES: ReadonlySet<string> = new Set(Object.values(AuthErrorCode))

const ACTION_ERRORS: Record<AuthAction, Partial<Record<AuthErrorCode, AuthResult>>> = {
  [AuthAction.SignIn]: {
    [AuthErrorCode.EmailAddressInvalid]: fieldError(
      AuthField.Email,
      'auth.common.errors.emailInvalid',
    ),
    [AuthErrorCode.InvalidCredentials]: messageError('login.errors.signInFailed'),
    [AuthErrorCode.EmailNotConfirmed]: messageError('login.errors.emailNotConfirmed'),
  },
  [AuthAction.SignUp]: {
    [AuthErrorCode.EmailAddressInvalid]: fieldError(
      AuthField.Email,
      'auth.common.errors.emailInvalid',
    ),
    [AuthErrorCode.WeakPassword]: fieldError(AuthField.Password, 'auth.common.errors.weakPassword'),
  },
  [AuthAction.ForgotPassword]: {
    [AuthErrorCode.EmailAddressInvalid]: fieldError(
      AuthField.Email,
      'auth.common.errors.emailInvalid',
    ),
  },
  [AuthAction.UpdatePassword]: {
    [AuthErrorCode.WeakPassword]: fieldError(AuthField.Password, 'auth.common.errors.weakPassword'),
    [AuthErrorCode.SamePassword]: fieldError(
      AuthField.Password,
      'auth.updatePassword.errors.samePassword',
    ),
    [AuthErrorCode.SessionExpired]: messageError('updatePassword.errors.sessionExpired'),
    [AuthErrorCode.SessionNotFound]: messageError('updatePassword.errors.sessionExpired'),
    [AuthErrorCode.RefreshTokenNotFound]: messageError('updatePassword.errors.sessionExpired'),
  },
  [AuthAction.SignOut]: {},
}

export const authError = (error: SupabaseAuthError, action: AuthAction): AuthResult => {
  const code = error.code ?? ''
  if (RATE_LIMIT_ERROR_CODES.has(code)) return messageError('common.errors.rateLimited')
  if (!KNOWN_AUTH_ERROR_CODES.has(code)) return systemError()

  return ACTION_ERRORS[action][code as AuthErrorCode] ?? systemError()
}
