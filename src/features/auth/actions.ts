'use server'

import 'server-only'

import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  passwordResetSchema,
  registrationSchema,
  updatePasswordSchema,
} from './schemas/auth'

export type AuthError =
  | 'invalidInput'
  | 'signInFailed'
  | 'signUpFailed'
  | 'resetFailed'
  | 'updateFailed'
  | 'sessionExpired'

export type AuthResult<T = null> = { success: true; data: T } | { success: false; error: AuthError }

function logUnexpectedAuthError(operation: string, error: unknown): void {
  console.error(`[auth] ${operation} failed unexpectedly`, error)
}

function getEmailRedirect(path: string): string {
  const origin = new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin
  return new URL(path, origin).toString()
}

export async function signInAction(values: unknown): Promise<AuthResult> {
  const input = loginSchema.safeParse(values)

  if (!input.success) return { success: false, error: 'invalidInput' }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword(input.data)

    if (error) return { success: false, error: 'signInFailed' }

    return { success: true, data: null }
  } catch (error) {
    logUnexpectedAuthError('sign in', error)
    return { success: false, error: 'signInFailed' }
  }
}

export async function signUpAction(
  values: unknown,
): Promise<AuthResult<{ confirmationRequired: boolean }>> {
  const input = registrationSchema.safeParse(values)

  if (!input.success) return { success: false, error: 'invalidInput' }

  const emailRedirectTo = getEmailRedirect(ROUTES.PUBLIC.AUTH.CONFIRM)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: input.data.email,
      password: input.data.password,
      options: {
        data: { full_name: input.data.name },
        emailRedirectTo,
      },
    })

    if (error) return { success: false, error: 'signUpFailed' }

    return { success: true, data: { confirmationRequired: !data.session } }
  } catch (error) {
    logUnexpectedAuthError('sign up', error)
    return { success: false, error: 'signUpFailed' }
  }
}

export async function requestPasswordResetAction(values: unknown): Promise<AuthResult> {
  const input = passwordResetSchema.safeParse(values)

  if (!input.success) return { success: false, error: 'invalidInput' }

  const redirectTo = getEmailRedirect(ROUTES.PUBLIC.AUTH.CONFIRM)

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(input.data.email, {
      redirectTo,
    })

    if (error) return { success: false, error: 'resetFailed' }

    // Always return the same success state so the form does not reveal whether an email exists.
    return { success: true, data: null }
  } catch (error) {
    logUnexpectedAuthError('password reset request', error)
    return { success: false, error: 'resetFailed' }
  }
}

export async function updatePasswordAction(values: unknown): Promise<AuthResult> {
  const input = updatePasswordSchema.safeParse(values)

  if (!input.success) return { success: false, error: 'invalidInput' }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    if (!data?.claims) return { success: false, error: 'sessionExpired' }

    const { error } = await supabase.auth.updateUser({ password: input.data.password })
    if (error) return { success: false, error: 'updateFailed' }

    return { success: true, data: null }
  } catch (error) {
    logUnexpectedAuthError('password update', error)
    return { success: false, error: 'updateFailed' }
  }
}
