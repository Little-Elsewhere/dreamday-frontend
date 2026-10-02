'use server'

import { ROUTES } from '@/constants/routes'
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
import { createClient } from '@/lib/supabase/server'
import { getRedirectPathname } from '@/features/auth/utils/common'

export const signIn = async (values: LoginFormValues): Promise<void> => {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(loginSchema.parse(values))

  if (error) throw new Error(error.message)
}

export const signUp = async (values: RegistrationFormValues): Promise<void> => {
  const { name, email, password } = registrationSchema.parse(values)
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: getRedirectPathname(ROUTES.PRIVATE.ACCOUNT),
    },
  })

  if (error) throw new Error(error.message)
}

export const forgotPassword = async (values: PasswordResetFormValues): Promise<void> => {
  const { email } = passwordResetSchema.parse(values)
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectPathname(ROUTES.PRIVATE.UPDATE_PASSWORD),
  })

  if (error) throw new Error(error.message)
}

export const signOut = async (): Promise<void> => {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(error.message)
}

export const updatePasswordAction = async (values: UpdatePasswordFormValues): Promise<void> => {
  const { password } = updatePasswordSchema.parse(values)
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) throw new Error('Password reset session is expired')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}
