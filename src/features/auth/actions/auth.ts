'use server'

import { createClient } from '@/lib/supabase/server'
import type { RegistrationFormValues } from '@/features/auth/schemas/auth'
import { ROUTES } from '@/constants/routes'

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
