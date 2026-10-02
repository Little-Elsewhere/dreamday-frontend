import { chmod, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const localEnvPath = resolve(projectRoot, '.env.local')
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

const apiUrl = status.API_URL
const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY
const databaseUrl = status.DB_URL

if (
  typeof apiUrl !== 'string' ||
  typeof publishableKey !== 'string' ||
  typeof databaseUrl !== 'string'
) {
  throw new Error('Supabase status is missing API_URL, PUBLISHABLE_KEY (or ANON_KEY), or DB_URL.')
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
]

for (const key of requiredDopplerValues) {
  if (!values.get(key)) {
    throw new Error(`Doppler config is missing required value ${key}.`)
  }
}

values.set('NEXT_PUBLIC_SUPABASE_URL', apiUrl)
values.set('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', publishableKey)
values.set('DATABASE_PASSWORD', databasePassword)

if (!values.get('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')) {
  values.delete('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN')
}

const escapeEnvValue = (value) => JSON.stringify(value).replaceAll('$', '\\$')
const output = `${[...values].map(([key, value]) => `${key}=${escapeEnvValue(value)}`).join('\n')}\n`
const temporaryPath = `${localEnvPath}.tmp-${process.pid}`

await writeFile(temporaryPath, output, { encoding: 'utf8', mode: 0o600 })
await rename(temporaryPath, localEnvPath)
await chmod(localEnvPath, 0o600)

console.log('Generated .env.local from Doppler and overrode local Supabase values.')
