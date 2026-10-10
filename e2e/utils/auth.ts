import { randomBytes, randomUUID } from 'node:crypto'

export const generateEmail = (accountType: 'worker' | 'register'): string =>
  `playwright-${accountType}-${randomUUID()}@dreamday-e2e.test`

export const generatePassword = (): string => randomBytes(32).toString('base64url')
