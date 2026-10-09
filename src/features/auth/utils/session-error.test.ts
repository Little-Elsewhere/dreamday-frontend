import type { AuthError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { AuthErrorCode, AuthErrorName } from '@/features/auth/constants/auth'
import { isMissingSession } from '@/features/auth/utils/session-error'

const createAuthError = (name: string, code?: string): AuthError => ({ name, code }) as AuthError

describe('isMissingSession', () => {
  it.each([AuthErrorName.SessionMissing, AuthErrorName.InvalidJwt])(
    'recognizes missing-session error name %s',
    (name) => {
      expect(isMissingSession(createAuthError(name))).toBe(true)
    },
  )

  it.each([
    AuthErrorCode.SessionNotFound,
    AuthErrorCode.SessionExpired,
    AuthErrorCode.RefreshTokenNotFound,
  ])('recognizes missing-session error code %s', (code) => {
    expect(isMissingSession(createAuthError('AuthError', code))).toBe(true)
  })

  it('returns false for an unrelated error code', () => {
    expect(isMissingSession(createAuthError('AuthError', AuthErrorCode.InvalidCredentials))).toBe(
      false,
    )
  })

  it('returns false for an unrelated name without a code', () => {
    expect(isMissingSession(createAuthError('AuthError'))).toBe(false)
  })
})
