'use server'

import { createClient } from '@/lib/supabase/server'
import { SignUpPayload } from '@/features/auth/schemas/auth_new'

export const signUp = async (values: SignUpPayload) => {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp(values)

  if (error) {
    throw new Error(error.message)
  }

  return data
}
