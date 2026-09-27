import { spawn } from 'node:child_process'

delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
delete process.env.NEXT_PUBLIC_POSTHOG_HOST

const child = spawn('next', ['dev'], { stdio: 'inherit' })

child.on('error', () => {
  console.error('Could not start Next.js. Check that project dependencies are installed.')
  process.exitCode = 1
})

child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
