import { describe, expect, it, vi } from 'vitest'
import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js'

import { AuthAction, AuthErrorCode, AuthField } from '@/features/auth/constants/auth'
import { authError } from '@/features/auth/utils/auth-error'
import { ActionErrorKind } from '@/types/action-result'

vi.mock('server-only', () => ({}))

const createAuthError = (code: string): SupabaseAuthError => ({ code }) as SupabaseAuthError

describe('authError', () => {
  it('returns the shared rate limit message for every auth action', () => {
    expect(
      authError(createAuthError(AuthErrorCode.OverRequestRateLimit), AuthAction.SignUp),
    ).toEqual({
      success: false,
      error: { kind: ActionErrorKind.Message, key: 'common.errors.rateLimited' },
    })
  })

  it('maps action-specific errors to their field or message', () => {
    expect(
      authError(createAuthError(AuthErrorCode.EmailAddressInvalid), AuthAction.SignIn),
    ).toEqual({
      success: false,
      error: {
        kind: ActionErrorKind.Field,
        field: AuthField.Email,
        key: 'auth.common.errors.emailInvalid',
      },
    })
    expect(
      authError(createAuthError(AuthErrorCode.WeakPassword), AuthAction.UpdatePassword),
    ).toEqual({
      success: false,
      error: {
        kind: ActionErrorKind.Field,
        field: AuthField.Password,
        key: 'auth.common.errors.weakPassword',
      },
    })
  })

  it('falls back to a system error for an unmapped code', () => {
    expect(authError(createAuthError('unknown_error'), AuthAction.SignIn)).toEqual({
      success: false,
      error: { kind: ActionErrorKind.System },
    })
  })
})
