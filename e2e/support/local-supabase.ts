import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getLocalSupabasePublicConfig, readLocalSupabaseStatus } from './supabase-status'

type LocalAuthUser = {
  email: string | null | undefined
  email_confirmed_at: string | null | undefined
  id: string
}

type LocalSupabaseConfig = {
  publishableKey: string
  secretKey: string
  url: string
}

const PAGE_SIZE = 1000

let configPromise: Promise<LocalSupabaseConfig> | undefined
let adminClient: SupabaseClient | undefined
let publicClient: SupabaseClient | undefined

const readLocalSupabaseConfig = async (): Promise<LocalSupabaseConfig> => {
  const status = readLocalSupabaseStatus()
  const publicConfig = getLocalSupabasePublicConfig(status)

  const secretKey =
    process.env.E2E_SUPABASE_SECRET_KEY ?? status.SECRET_KEY ?? status.SERVICE_ROLE_KEY

  if (typeof secretKey !== 'string' || secretKey.length === 0) {
    throw new Error('Local Supabase status did not include an admin key for E2E account lookup.')
  }

  return {
    url: publicConfig.url,
    secretKey,
    publishableKey: publicConfig.publishableKey,
  }
}

const getConfig = (): Promise<LocalSupabaseConfig> => {
  configPromise ??= readLocalSupabaseConfig()
  return configPromise
}

export const getLocalAdminClient = async (): Promise<SupabaseClient> => {
  if (adminClient) return adminClient

  const config = await getConfig()
  adminClient = createClient(config.url, config.secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })
  return adminClient
}

export const resendLocalSignupConfirmation = async (email: string): Promise<void> => {
  const config = await getConfig()
  publicClient ??= createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })

  const { error } = await publicClient.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: 'http://dreamday.local/en/trips' },
  })
  if (error) throw new Error(`Could not resend the local signup confirmation for ${email}.`)
}

export const findLocalAuthUser = async (email: string): Promise<LocalAuthUser | null> => {
  const client = await getLocalAdminClient()
  let page = 1

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE_SIZE })
    if (error) throw new Error('Could not check whether the local E2E account exists.')

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    )
    if (user) {
      return {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
      }
    }

    if (data.users.length < PAGE_SIZE) return null
    page += 1
  }
}

export const deleteLocalAuthUser = async (email: string): Promise<void> => {
  const user = await findLocalAuthUser(email)
  if (!user) return

  const client = await getLocalAdminClient()
  const { error } = await client.auth.admin.deleteUser(user.id)
  if (error) throw new Error(`Could not remove the temporary local E2E account ${email}.`)
}
