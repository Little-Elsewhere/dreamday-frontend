import { describe, expect, it } from 'vitest'

import { ActionErrorKind } from '@/types/action-result'
import { fieldError, messageError, systemError } from '@/utils/action-result'

describe('fieldError', () => {
  it('returns a field-level action failure', () => {
    expect(fieldError('email', 'auth.login.errors.invalidEmail')).toEqual({
      success: false,
      error: {
        kind: ActionErrorKind.Field,
        field: 'email',
        key: 'auth.login.errors.invalidEmail',
      },
    })
  })
})

describe('messageError', () => {
  it('returns a message-level action failure', () => {
    expect(messageError('auth.errors.sessionExpired')).toEqual({
      success: false,
      error: {
        kind: ActionErrorKind.Message,
        key: 'auth.errors.sessionExpired',
      },
    })
  })
})

describe('systemError', () => {
  it('returns a system-level action failure', () => {
    expect(systemError()).toEqual({
      success: false,
      error: { kind: ActionErrorKind.System },
    })
  })
})
