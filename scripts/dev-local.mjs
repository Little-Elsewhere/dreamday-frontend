import { execFileSync, spawn } from 'node:child_process'

let status

try {
  const output = execFileSync('pnpm', ['exec', 'supabase', 'status', '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  status = JSON.parse(output)
} catch {
  console.error(
    'Could not read local Supabase status. Start the local stack with `pnpm supabase:start` and try again.',
  )
  process.exit(1)
}

const apiUrl = status.API_URL
const publishableKey = status.PUBLISHABLE_KEY

if (!apiUrl || !publishableKey) {
  console.error(
    'Local Supabase did not return an API URL and publishable key. Check `pnpm supabase:status` and try again.',
  )
  process.exit(1)
}

if (!publishableKey.startsWith('sb_publishable_')) {
  console.error('Local Supabase did not return a Publishable key.')
  process.exit(1)
}

let apiHostname

try {
  apiHostname = new URL(apiUrl).hostname
} catch {
  console.error('Local Supabase returned an invalid API URL.')
  process.exit(1)
}

if (!['localhost', '127.0.0.1'].includes(apiHostname)) {
  console.error('Refusing to start local development with a non-local Supabase URL.')
  process.exit(1)
}

delete process.env.DOPPLER_TOKEN

const child = spawn('node', ['scripts/run-local-next.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DOPPLER_ENVIRONMENT: 'dev',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    DATABASE_PASSWORD: 'postgres',
  },
})

child.on('error', () => {
  console.error('Could not start the local app. Check that project dependencies are installed.')
  process.exitCode = 1
})

child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
