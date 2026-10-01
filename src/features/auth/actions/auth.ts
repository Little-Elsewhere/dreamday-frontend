'use server'

import { revalidatePath } from 'next/cache'

import { ROUTES } from '@/constants/routes'
import {
  loginSchema,
  type LoginFormValues,
  type RegistrationFormValues,
} from '@/features/auth/schemas/auth'
import { createClient } from '@/lib/supabase/server'

export const signIn = async (values: LoginFormValues): Promise<void> => {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(loginSchema.parse(values))

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}

export const signUp = async (values: RegistrationFormValues) => {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { full_name: values.name },
      emailRedirectTo: ROUTES.PRIVATE.ACCOUNT,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
