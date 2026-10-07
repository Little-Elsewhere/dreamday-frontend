'use server'

import { z } from 'zod'

import { Locale } from '@/constants/locale'
import { ROUTES } from '@/constants/routes'
import { AuthAction, AuthErrorCode } from '@/features/auth/constants/auth'
import {
  loginSchema,
  passwordResetSchema,
  registrationSchema,
  updatePasswordSchema,
  type LoginFormValues,
  type PasswordResetFormValues,
  type RegistrationFormValues,
  type UpdatePasswordFormValues,
} from '@/features/auth/schemas/auth'
import type { AuthResult } from '@/features/auth/types/auth-result'
import { authError } from '@/features/auth/utils/auth-error'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { isMissingSession } from '@/features/auth/utils/session-error'
import { createClient } from '@/lib/supabase/server'
import { messageError, systemError } from '@/utils/action-result'

export const signIn = async (values: LoginFormValues): Promise<AuthResult> => {
  const validated = loginSchema.parse(values)

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword(validated)
    return error ? authError(error, AuthAction.SignIn) : { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const signUp = async (
  values: RegistrationFormValues,
  locale: string,
): Promise<AuthResult> => {
  const validated = registrationSchema.parse(values)
  const parsedLocale = z.enum(Locale).safeParse(locale)
  if (!parsedLocale.success) return systemError()

  const { name, email, password } = validated

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, locale: parsedLocale.data },
        emailRedirectTo: generateLocalizedUrl(parsedLocale.data, ROUTES.PRIVATE.ACCOUNT, {
          fullUrl: true,
          includeLocale: true,
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
  } catch {
    return systemError()
  }
}

export const forgotPassword = async (
  values: PasswordResetFormValues,
  locale: string,
): Promise<AuthResult> => {
  const validated = passwordResetSchema.parse(values)
  const parsedLocale = z.enum(Locale).safeParse(locale)
  if (!parsedLocale.success) return systemError()

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: generateLocalizedUrl(parsedLocale.data, ROUTES.PRIVATE.UPDATE_PASSWORD, {
        fullUrl: true,
        includeLocale: true,
      }),
    })
    return error ? authError(error, AuthAction.ForgotPassword) : { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const signOut = async (): Promise<AuthResult> => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    return error ? authError(error, AuthAction.SignOut) : { success: true, data: null }
  } catch {
    return systemError()
  }
}

export const updatePassword = async (values: UpdatePasswordFormValues): Promise<AuthResult> => {
  const validated = updatePasswordSchema.parse(values)

  try {
    const supabase = await createClient()
    const { data, error: claimsError } = await supabase.auth.getClaims()
    if (claimsError && isMissingSession(claimsError)) {
      return messageError('updatePassword.errors.sessionExpired')
    }
    if (claimsError) return authError(claimsError, AuthAction.UpdatePassword)
    if (!data?.claims) {
      return messageError('updatePassword.errors.sessionExpired')
    }

    const { error } = await supabase.auth.updateUser({ password: validated.password })
    return error ? authError(error, AuthAction.UpdatePassword) : { success: true, data: null }
  } catch {
    return systemError()
  }
}
