import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const localEnvPath = resolve(process.cwd(), '.env.local')

const parseGeneratedEnv = (contents: string): Record<string, string> =>
  Object.fromEntries(
    contents
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf('=')
        if (separatorIndex < 1) throw new Error()

        // generate-local-env.mjs writes JSON-quoted values and escapes `$` for Next.js.
        const encodedValue = line.slice(separatorIndex + 1).replaceAll('\\$', '$')
        const value: unknown = JSON.parse(encodedValue)
        if (typeof value !== 'string') throw new Error()

        return [line.slice(0, separatorIndex), value]
      }),
  )

export const readLocalEnv = (): Record<string, string> => {
  try {
    return parseGeneratedEnv(readFileSync(localEnvPath, 'utf8'))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return {}
    throw new Error('Could not read the generated .env.local file for Playwright.')
  }
}
