'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'

import { ROUTES } from '@/constants/routes'
import { serverEnv } from '@/env/server'
import { createClient } from '@/lib/supabase/server'
import { passwordResetSchema, updatePasswordSchema } from './schemas/auth'

export type AuthError =
  | 'invalidInput'
  | 'signInFailed'
  | 'signUpFailed'
  | 'resetFailed'
  | 'updateFailed'
  | 'signOutFailed'
  | 'sessionExpired'

export type AuthResult<T = null> = { success: true; data: T } | { success: false; error: AuthError }

const logUnexpectedAuthError = (operation: string, error: unknown): void => {
  console.error(`[auth] ${operation} failed unexpectedly`, error)
}

const getEmailRedirect = (path: string): string => {
  const origin = new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin
  return new URL(path, origin).toString()
}

export const signOutAction = async (): Promise<AuthResult> => {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) return { success: false, error: 'signOutFailed' }

    revalidatePath('/', 'layout')
    return { success: true, data: null }
  } catch (error) {
    logUnexpectedAuthError('sign out', error)
    return { success: false, error: 'signOutFailed' }
  }
}

export const requestPasswordResetAction = async (values: unknown): Promise<AuthResult> => {
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

export const updatePasswordAction = async (values: unknown): Promise<AuthResult> => {
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
