import 'server-only'

import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import { AuthAction, AuthErrorCode, AuthField } from '@/features/auth/constants/auth'
import type { AuthResult } from '@/features/auth/types/auth-result'
import { fieldError, messageError, systemError } from '@/utils/action-result'

export const authError = (error: SupabaseAuthError, action: AuthAction): AuthResult => {
  switch (error.code) {
    case AuthErrorCode.OverEmailSendRateLimit:
    case AuthErrorCode.OverRequestRateLimit:
      return messageError('common.errors.rateLimited')
  }

  switch (action) {
    case AuthAction.SignIn:
      switch (error.code) {
        case AuthErrorCode.EmailAddressInvalid:
          return fieldError(AuthField.Email, 'auth.common.errors.emailInvalid')
        case AuthErrorCode.InvalidCredentials:
          return messageError('login.errors.signInFailed')
        case AuthErrorCode.EmailNotConfirmed:
          return messageError('login.errors.emailNotConfirmed')
      }
      break
    case AuthAction.SignUp:
      switch (error.code) {
        case AuthErrorCode.EmailAddressInvalid:
          return fieldError(AuthField.Email, 'auth.common.errors.emailInvalid')
        case AuthErrorCode.WeakPassword:
          return fieldError(AuthField.Password, 'auth.common.errors.weakPassword')
      }
      break
    case AuthAction.ForgotPassword:
      switch (error.code) {
        case AuthErrorCode.EmailAddressInvalid:
          return fieldError(AuthField.Email, 'auth.common.errors.emailInvalid')
      }
      break
    case AuthAction.UpdatePassword:
      switch (error.code) {
        case AuthErrorCode.WeakPassword:
          return fieldError(AuthField.Password, 'auth.common.errors.weakPassword')
        case AuthErrorCode.SamePassword:
          return fieldError(AuthField.Password, 'auth.updatePassword.errors.samePassword')
        case AuthErrorCode.SessionExpired:
        case AuthErrorCode.SessionNotFound:
        case AuthErrorCode.RefreshTokenNotFound:
          return messageError('updatePassword.errors.sessionExpired')
      }
      break
    case AuthAction.SignOut:
      break
  }

  return systemError()
}
