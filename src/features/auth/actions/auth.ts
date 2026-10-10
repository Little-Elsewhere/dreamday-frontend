'use server'

import type { Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { AuthAction, AuthErrorCode } from '@/features/auth/constants/auth'
import {
  type LoginFormValues,
  loginSchema,
  type PasswordResetFormValues,
  passwordResetSchema,
  type RegistrationFormValues,
  registrationSchema,
  type UpdatePasswordFormValues,
  updatePasswordSchema,
} from '@/features/auth/schemas/auth'
import type {
  AuthActionFailure,
  AuthActionResult,
  AuthResult,
} from '@/features/auth/types/auth-result'
import { authError } from '@/features/auth/utils/auth-error'
import { generateLocalizedUrl, getAuthSystemErrorUrl } from '@/features/auth/utils/common'
import { isMissingSession } from '@/features/auth/utils/session-error'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { localeSchema } from '@/schemas/locale'
import { ActionErrorKind } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { runValidatedAction } from '@/utils/server-action'

const executeAuthAction = async (
  operation: () => Promise<AuthResult>,
  action: AuthAction,
  locale: Locale,
): Promise<AuthActionResult> => {
  const result = await runValidatedAction(action, operation)

  if (result.success) return result

  switch (result.error.kind) {
    case ActionErrorKind.System:
      return redirect({ href: getAuthSystemErrorUrl(), locale })
    case ActionErrorKind.Field:
    case ActionErrorKind.Message:
      return { success: false, error: result.error }
  }
}

export const signIn = async (
  values: LoginFormValues,
  locale: Locale,
): Promise<AuthActionFailure> => {
  const validated = loginSchema.parse(values)
  const validatedLocale = localeSchema.parse(locale)

  const result = await executeAuthAction(
    async () => {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithPassword(validated)
      return error ? authError(error, AuthAction.SignIn) : { success: true, data: null }
    },
    AuthAction.SignIn,
    validatedLocale,
  )

  if (result.success) return redirect({ href: ROUTES.PRIVATE.TRIPS, locale: validatedLocale })
  return result
}

export const signUp = async (
  values: RegistrationFormValues,
  locale: Locale,
): Promise<AuthActionFailure> => {
  const validated = registrationSchema.parse(values)
  const validatedLocale = localeSchema.parse(locale)

  const { name, email, password } = validated

  const result = await executeAuthAction(
    async () => {
      const supabase = await createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, locale: validatedLocale },
          emailRedirectTo: generateLocalizedUrl(ROUTES.PRIVATE.TRIPS, {
            locale: validatedLocale,
            fullUrl: true,
          }),
        },
      })
      if (
        error?.code === AuthErrorCode.EmailExists ||
        error?.code === AuthErrorCode.UserAlreadyExists
      ) {
        return { success: true, data: null }
      }

      return error ? authError(error, AuthAction.SignUp) : { success: true, data: null }
    },
    AuthAction.SignUp,
    validatedLocale,
  )

  if (result.success) {
    return redirect({ href: ROUTES.PUBLIC.AUTH.REGISTER_SUCCESS, locale: validatedLocale })
  }
  return result
}

export const forgotPassword = async (
  values: PasswordResetFormValues,
  locale: Locale,
): Promise<AuthActionFailure> => {
  const validated = passwordResetSchema.parse(values)
  const validatedLocale = localeSchema.parse(locale)

  const result = await executeAuthAction(
    async () => {
      const supabase = await createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: generateLocalizedUrl(ROUTES.PRIVATE.UPDATE_PASSWORD, {
          locale: validatedLocale,
          fullUrl: true,
        }),
      })
      return error ? authError(error, AuthAction.ForgotPassword) : { success: true, data: null }
    },
    AuthAction.ForgotPassword,
    validatedLocale,
  )

  if (result.success) {
    return redirect({ href: ROUTES.PUBLIC.AUTH.RECOVERY_SUCCESS, locale: validatedLocale })
  }
  return result
}

export const signOut = async (locale: Locale): Promise<AuthActionFailure> => {
  const validatedLocale = localeSchema.parse(locale)
  const result = await executeAuthAction(
    async () => {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut()
      return error ? authError(error, AuthAction.SignOut) : { success: true, data: null }
    },
    AuthAction.SignOut,
    validatedLocale,
  )

  if (result.success) return redirect({ href: ROUTES.PUBLIC.AUTH.LOGIN, locale: validatedLocale })
  return result
}

export const updatePassword = async (
  values: UpdatePasswordFormValues,
  locale: Locale,
): Promise<AuthActionResult> => {
  const validated = updatePasswordSchema.parse(values)
  const validatedLocale = localeSchema.parse(locale)

  return executeAuthAction(
    async () => {
      const supabase = await createClient()
      const { data, error: claimsError } = await supabase.auth.getClaims()
      if (claimsError && isMissingSession(claimsError)) {
        return messageError('updatePassword.errors.sessionExpired')
      }
      if (claimsError) return authError(claimsError, AuthAction.UpdatePassword)
      if (!data?.claims) return messageError('updatePassword.errors.sessionExpired')

      const { error } = await supabase.auth.updateUser({ password: validated.password })
      return error ? authError(error, AuthAction.UpdatePassword) : { success: true, data: null }
    },
    AuthAction.UpdatePassword,
    validatedLocale,
  )
}
