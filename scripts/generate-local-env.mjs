import { chmod, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const localEnvPath = resolve(projectRoot, '.env.local')
const localSupabaseUrl = 'http://supabase.local'
const localAppUrl = 'http://dreamday.local'
const [dopplerPath, statusPath] = process.argv.slice(2)

if (!dopplerPath || !statusPath) {
  throw new Error('Pass JSON files from `doppler secrets download` and `supabase status -o json`.')
}

const parseJsonFile = async (path, sourceName) => {
  try {
    return JSON.parse(await readFile(resolve(path), 'utf8'))
  } catch {
    throw new Error(`Could not parse JSON returned by ${sourceName}.`)
  }
}

const parseDopplerValues = (value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Doppler did not return a JSON object of environment variables.')
  }

  const values = new Map()

  for (const [key, secretValue] of Object.entries(value)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || typeof secretValue !== 'string') {
      throw new Error('Doppler returned an invalid environment variable entry.')
    }

    values.set(key, secretValue)
  }

  return values
}

const values = parseDopplerValues(await parseJsonFile(dopplerPath, 'Doppler'))
const status = await parseJsonFile(statusPath, 'Supabase status')

const publishableKey = status.PUBLISHABLE_KEY
const databaseUrl = status.DB_URL

if (
  typeof publishableKey !== 'string' ||
  publishableKey.length === 0 ||
  typeof databaseUrl !== 'string' ||
  databaseUrl.length === 0
) {
  throw new Error('Supabase status is missing a publishable key or DB URL.')
}

let databasePassword

try {
  databasePassword = decodeURIComponent(new URL(databaseUrl).password)
} catch {
  throw new Error('Could not read the database password from Supabase status DB_URL.')
}

if (!databasePassword) {
  throw new Error('Supabase status DB_URL does not contain a database password.')
}

const requiredDopplerValues = [
  'DOPPLER_ENVIRONMENT',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_DEFAULT_TITLE',
  'NEXT_PUBLIC_APP_TITLE_TEMPLATE',
  'NEXT_PUBLIC_APP_DESCRIPTION',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_PORT',
]

for (const key of requiredDopplerValues) {
  if (!values.get(key)) {
    throw new Error(`Doppler config is missing required value ${key}.`)
  }
}

const appPortValue = values.get('NEXT_PUBLIC_APP_PORT')
const appPort = Number(appPortValue)

if (!/^\d+$/.test(appPortValue) || !Number.isInteger(appPort) || appPort < 1 || appPort > 65535) {
  throw new Error('NEXT_PUBLIC_APP_PORT must be an integer between 1 and 65535.')
}

values.set('NEXT_PUBLIC_APP_PORT', String(appPort))
values.set('NEXT_PUBLIC_APP_URL', localAppUrl)
values.set('NEXT_PUBLIC_SUPABASE_URL', localSupabaseUrl)
values.set('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', publishableKey)
values.set('DATABASE_PASSWORD', databasePassword)

if (!values.get('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')) {
  values.delete('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')
}

const escapeEnvValue = (value) => JSON.stringify(value).replaceAll('$', '\\$')
const output = `${[...values].map(([key, value]) => `${key}=${escapeEnvValue(value)}`).join('\n')}\n`

const writeAtomically = async (path, contents) => {
  const temporaryPath = `${path}.tmp-${process.pid}`
  await writeFile(temporaryPath, contents, { encoding: 'utf8', mode: 0o600 })
  await rename(temporaryPath, path)
  await chmod(path, 0o600)
}

await writeAtomically(localEnvPath, output)

console.log(`Generated .env.local (app port ${appPort}) from Doppler and local Supabase status.`)
