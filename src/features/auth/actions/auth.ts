'use server'

import { hasLocale } from 'next-intl'

import { API_ROUTES } from '@/constants/api-routes'
import { ROUTES } from '@/constants/routes'
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  refreshSessionTokens,
  setSessionTokens,
} from '@/features/auth/actions/session'
import { AUTH_MESSAGE_CODE } from '@/features/auth/constants/codes'
import {
  type MessageResponse,
  messageResponseSchema,
  type TokenResponse,
  tokenResponseSchema,
} from '@/features/auth/schemas/api'
import {
  type LoginFormValues,
  loginSchema,
  type PasswordResetFormValues,
  passwordResetSchema,
  type RegistrationFormValues,
  registrationSchema,
  type ResetPasswordFormValues,
  resetPasswordSchema,
  type UpdatePasswordFormValues,
  updatePasswordSchema,
} from '@/features/auth/schemas/auth'
import { redirect } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { ActionResult } from '@/types/action-result'
import { fieldError, messageError } from '@/utils/action-result'
import { isMessageCode, post } from '@/utils/api-client'

const checkEmailHref = (email: string) => {
  const params = new URLSearchParams({ email })
  return `${ROUTES.PUBLIC.AUTH.REGISTER_SUCCESS}?${params.toString()}`
}

const redirectTo = (href: string, locale: string) => {
  redirect({
    href,
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  })
}

export const register = async (
  input: RegistrationFormValues,
  locale: string,
): Promise<ActionResult<{ email: string }, 'email' | 'password' | 'confirmPassword'>> => {
  const parsed = registrationSchema.safeParse(input)
  if (!parsed.success) return messageError('auth.common.errors.system')

  const { email, password } = parsed.data
  const result = await post<MessageResponse>(API_ROUTES.AUTH.REGISTER, messageResponseSchema, {
    body: { email, password },
  })

  if (isMessageCode(result, AUTH_MESSAGE_CODE.REGISTRATION_ACCEPTED)) {
    redirectTo(checkEmailHref(email), locale)
  }

  if (!result.ok && result.code === AUTH_MESSAGE_CODE.EMAIL_ALREADY_REGISTERED) {
    return messageError('auth.register.errors.emailAlreadyRegistered')
  }

  return messageError('auth.common.errors.system')
}

export const resendVerification = async (
  email: string,
): Promise<ActionResult<{ resent: true }>> => {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return messageError('auth.common.errors.system')

  const result = await post<MessageResponse>(
    API_ROUTES.AUTH.RESEND_VERIFICATION,
    messageResponseSchema,
    { body: { email: trimmed } },
  )
  if (isMessageCode(result, AUTH_MESSAGE_CODE.VERIFICATION_RESEND_ACCEPTED)) {
    return { success: true, data: { resent: true } }
  }

  return messageError('auth.common.errors.system')
}

export const login = async (
  input: LoginFormValues,
  locale: string,
): Promise<ActionResult<{ email: string }, 'email' | 'password'>> => {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return messageError('auth.common.errors.system')

  const { email, password } = parsed.data
  const result = await post<TokenResponse>(API_ROUTES.AUTH.LOGIN, tokenResponseSchema, {
    body: { email, password },
  })

  if (result.ok) {
    await setSessionTokens(result.data)
    redirectTo(ROUTES.PRIVATE.ACCOUNT, locale)
  } else if (result.code === AUTH_MESSAGE_CODE.INVALID_CREDENTIALS) {
    return messageError('auth.login.errors.signInFailed')
  } else if (result.code === AUTH_MESSAGE_CODE.EMAIL_NOT_VERIFIED) {
    await post(API_ROUTES.AUTH.RESEND_VERIFICATION, messageResponseSchema, {
      body: { email },
    })
    redirectTo(checkEmailHref(email), locale)
  } else if (result.code === AUTH_MESSAGE_CODE.ACCOUNT_DISABLED) {
    return messageError('auth.login.errors.accountDisabled')
  }

  return messageError('auth.common.errors.system')
}

export const forgotPassword = async (
  input: PasswordResetFormValues,
  locale: string,
): Promise<ActionResult<{ email: string }, 'email'>> => {
  const parsed = passwordResetSchema.safeParse(input)
  if (!parsed.success) return messageError('auth.common.errors.system')

  const result = await post<MessageResponse>(
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    messageResponseSchema,
    { body: { email: parsed.data.email } },
  )
  if (isMessageCode(result, AUTH_MESSAGE_CODE.PASSWORD_RESET_EMAIL_ACCEPTED)) {
    redirectTo(ROUTES.PUBLIC.AUTH.RECOVERY_SUCCESS, locale)
  }

  return messageError('auth.recovery.errors.resetFailed')
}

export const resetPassword = async (
  token: string,
  input: ResetPasswordFormValues,
  locale: string,
): Promise<ActionResult<{ reset: true }, 'password' | 'confirmPassword'>> => {
  if (!token) return messageError('auth.resetPassword.errors.invalidLink')

  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return messageError('auth.common.errors.system')

  const result = await post<MessageResponse>(
    API_ROUTES.AUTH.RESET_PASSWORD,
    messageResponseSchema,
    {
      body: { token, password: parsed.data.password },
    },
  )

  if (isMessageCode(result, AUTH_MESSAGE_CODE.PASSWORD_RESET_SUCCESS)) {
    await clearSessionTokens()
    redirectTo(ROUTES.PUBLIC.AUTH.LOGIN, locale)
  }

  if (!result.ok && result.code === AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_PASSWORD_RESET_LINK) {
    return messageError('auth.resetPassword.errors.invalidLink')
  }

  return messageError('auth.resetPassword.errors.resetFailed')
}

export const updatePassword = async (
  input: UpdatePasswordFormValues,
): Promise<ActionResult<{ updated: true }, 'currentPassword' | 'password' | 'confirmPassword'>> => {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) return messageError('auth.common.errors.system')

  let accessToken = await getAccessToken()
  if (!accessToken) {
    const tokens = await refreshSessionTokens()
    accessToken = tokens?.access_token
  }
  if (!accessToken) return messageError('auth.updatePassword.errors.sessionExpired')

  const updateBody = {
    current_password: parsed.data.currentPassword,
    new_password: parsed.data.password,
  }

  let result = await post<TokenResponse>(API_ROUTES.AUTH.UPDATE_PASSWORD, tokenResponseSchema, {
    accessToken,
    body: updateBody,
  })

  if (
    !result.ok &&
    (result.code === AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN ||
      result.code === AUTH_MESSAGE_CODE.BEARER_ACCESS_TOKEN_REQUIRED)
  ) {
    const tokens = await refreshSessionTokens()
    if (!tokens) return messageError('auth.updatePassword.errors.sessionExpired')

    result = await post<TokenResponse>(API_ROUTES.AUTH.UPDATE_PASSWORD, tokenResponseSchema, {
      accessToken: tokens.access_token,
      body: updateBody,
    })
  }

  if (result.ok) {
    await setSessionTokens(result.data)
    return { success: true, data: { updated: true } }
  }

  if (result.code === AUTH_MESSAGE_CODE.INVALID_CURRENT_PASSWORD) {
    return fieldError('currentPassword', 'auth.updatePassword.errors.currentPasswordIncorrect')
  }

  if (
    result.code === AUTH_MESSAGE_CODE.BEARER_ACCESS_TOKEN_REQUIRED ||
    result.code === AUTH_MESSAGE_CODE.INVALID_OR_EXPIRED_ACCESS_TOKEN
  ) {
    await clearSessionTokens()
    return messageError('auth.updatePassword.errors.sessionExpired')
  }

  return messageError('auth.updatePassword.errors.updateFailed')
}

export const logout = async (locale: string): Promise<void> => {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    await post(API_ROUTES.AUTH.LOGOUT, messageResponseSchema, {
      body: { refresh_token: refreshToken },
    })
  }

  await clearSessionTokens()
  redirectTo(ROUTES.PUBLIC.AUTH.LOGIN, locale)
}
