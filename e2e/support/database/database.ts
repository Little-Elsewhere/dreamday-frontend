import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getLocalSupabasePublicConfig, readLocalSupabaseStatus } from '../supabase/supabase'

const PAGE_SIZE = 1000

let adminClient: SupabaseClient | undefined

const getAdminClient = (): SupabaseClient => {
  if (adminClient) return adminClient

  const status = readLocalSupabaseStatus()
  const { url } = getLocalSupabasePublicConfig(status)
  const secretKey = status.SECRET_KEY

  if (typeof secretKey !== 'string' || secretKey.length === 0) {
    throw new Error('Local Supabase status did not include an admin key for E2E cleanup.')
  }

  adminClient = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })
  return adminClient
}

const findUserId = async (email: string): Promise<string | null> => {
  const client = getAdminClient()

  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
    if (error) throw new Error('Could not find the temporary local E2E account.')

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    )
    if (user) return user.id
    if (data.users.length < PAGE_SIZE) return null
  }
}

export const deleteUser = async (email: string): Promise<void> => {
  const userId = await findUserId(email)
  if (!userId) return

  const { error } = await getAdminClient().auth.admin.deleteUser(userId)
  if (error) throw new Error('Could not remove the temporary local E2E account.')
}
