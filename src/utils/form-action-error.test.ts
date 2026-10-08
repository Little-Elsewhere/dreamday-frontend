import { describe, expect, it, vi } from 'vitest'
import type { FieldPath, UseFormSetError } from 'react-hook-form'

import { ActionErrorKind } from '@/types/action-result'
import { handleFormActionError } from '@/utils/form-action-error'

type FormValues = {
  email: string
  password: string
}

const fields = ['email', 'password'] as const satisfies readonly FieldPath<FormValues>[]

const createOptions = () => ({
  fields,
  setError: vi.fn<UseFormSetError<FormValues>>(),
  onMessage: vi.fn<(key: string) => void>(),
  onSystemError: vi.fn<() => void>(),
})

describe('handleFormActionError', () => {
  it('sets a focused server error for a configured field', () => {
    const options = createOptions()

    handleFormActionError<FormValues>(
      {
        kind: ActionErrorKind.Field,
        field: 'email',
        key: 'auth.common.errors.emailInvalid',
      },
      options,
    )

    expect(options.setError).toHaveBeenCalledWith(
      'email',
      { type: 'server', message: 'auth.common.errors.emailInvalid' },
      { shouldFocus: true },
    )
    expect(options.onMessage).not.toHaveBeenCalled()
    expect(options.onSystemError).not.toHaveBeenCalled()
  })

  it('uses the system error callback when the field is not configured', () => {
    const options = createOptions()

    handleFormActionError<FormValues>(
      { kind: ActionErrorKind.Field, field: 'phone', key: 'auth.errors.invalidPhone' },
      options,
    )

    expect(options.setError).not.toHaveBeenCalled()
    expect(options.onMessage).not.toHaveBeenCalled()
    expect(options.onSystemError).toHaveBeenCalledOnce()
  })

  it('routes message errors to the message callback', () => {
    const options = createOptions()

    handleFormActionError<FormValues>(
      { kind: ActionErrorKind.Message, key: 'auth.errors.sessionExpired' },
      options,
    )

    expect(options.onMessage).toHaveBeenCalledOnce()
    expect(options.onMessage).toHaveBeenCalledWith('auth.errors.sessionExpired')
    expect(options.setError).not.toHaveBeenCalled()
    expect(options.onSystemError).not.toHaveBeenCalled()
  })

  it('routes system errors to the system error callback', () => {
    const options = createOptions()

    handleFormActionError<FormValues>({ kind: ActionErrorKind.System }, options)

    expect(options.onSystemError).toHaveBeenCalledOnce()
    expect(options.setError).not.toHaveBeenCalled()
    expect(options.onMessage).not.toHaveBeenCalled()
  })
})
