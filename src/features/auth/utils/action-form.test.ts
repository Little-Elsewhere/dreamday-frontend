import { describe, expect, it, vi } from 'vitest'

import { applyFormError } from '@/features/auth/utils/action-form'
import { ActionErrorKind } from '@/types/action-result'

describe('applyFormError', () => {
  it('maps field errors onto the form', () => {
    const setError = vi.fn()
    const setFormMessage = vi.fn()
    const t = vi.fn((key: string) => key)

    applyFormError(
      {
        success: false,
        error: {
          kind: ActionErrorKind.Field,
          field: 'email',
          key: 'auth.register.errors.emailAlreadyRegistered',
        },
      },
      setError,
      setFormMessage,
      t,
    )

    expect(setError).toHaveBeenCalledWith('email', {
      type: 'server',
      message: 'auth.register.errors.emailAlreadyRegistered',
    })
    expect(setFormMessage).not.toHaveBeenCalled()
  })

  it('translates message errors into form feedback', () => {
    const setError = vi.fn()
    const setFormMessage = vi.fn()
    const t = vi.fn((key: string) => `translated:${key}`)

    applyFormError(
      {
        success: false,
        error: {
          kind: ActionErrorKind.Message,
          key: 'auth.login.errors.signInFailed',
        },
      },
      setError,
      setFormMessage,
      t,
    )

    expect(setError).not.toHaveBeenCalled()
    expect(t).toHaveBeenCalledWith('auth.login.errors.signInFailed')
    expect(setFormMessage).toHaveBeenCalledWith('translated:auth.login.errors.signInFailed')
  })

  it('falls back to the system message for unknown error kinds', () => {
    const setError = vi.fn()
    const setFormMessage = vi.fn()
    const t = vi.fn((key: string) => `translated:${key}`)

    applyFormError(
      {
        success: false,
        error: { kind: ActionErrorKind.System },
      },
      setError,
      setFormMessage,
      t,
    )

    expect(setFormMessage).toHaveBeenCalledWith('translated:auth.common.errors.system')
  })
})
