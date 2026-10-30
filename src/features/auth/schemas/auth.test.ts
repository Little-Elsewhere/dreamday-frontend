import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  passwordResetSchema,
  registrationSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@/features/auth/schemas/auth'

const validPassword = 'password-12345'
const boundaryPassword = 'p'.repeat(12)
const longPassword = 'p'.repeat(129)
const longEmail = `${'a'.repeat(64)}@${'b'.repeat(190)}.com`

const issueMessages = (result: {
  success: false
  error: { issues: { message: string; path: PropertyKey[] }[] }
}) => result.error.issues.map((issue) => ({ message: issue.message, path: issue.path }))

describe('loginSchema', () => {
  it('accepts a trimmed email and non-empty password', () => {
    expect(
      loginSchema.parse({
        email: '  User@Example.com ',
        password: 'x',
      }),
    ).toEqual({
      email: 'User@Example.com',
      password: 'x',
    })
  })

  it('rejects an invalid email with the invalid-email message', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.emailInvalid',
        path: ['email'],
      })
    }
  })

  it('rejects an empty password with the required-password message', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordRequired',
        path: ['password'],
      })
    }
  })

  it('rejects a password longer than 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: longPassword,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordTooLong',
        path: ['password'],
      })
    }
  })
})

describe('registrationSchema', () => {
  it('accepts matching passwords at the 12-character boundary', () => {
    expect(
      registrationSchema.parse({
        email: 'user@example.com',
        password: boundaryPassword,
        confirmPassword: boundaryPassword,
      }),
    ).toEqual({
      email: 'user@example.com',
      password: boundaryPassword,
      confirmPassword: boundaryPassword,
    })
  })

  it('rejects a short password with the too-short message', () => {
    const result = registrationSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordTooShort',
        path: ['password'],
      })
    }
  })

  it('rejects mismatched confirmation on the confirmPassword path', () => {
    const result = registrationSchema.safeParse({
      email: 'user@example.com',
      password: validPassword,
      confirmPassword: 'different-pass',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordMismatch',
        path: ['confirmPassword'],
      })
    }
  })

  it('rejects an empty confirmation password', () => {
    const result = registrationSchema.safeParse({
      email: 'user@example.com',
      password: validPassword,
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === 'auth.common.errors.confirmPasswordRequired',
        ),
      ).toBe(true)
    }
  })

  it('rejects emails longer than 254 characters', () => {
    const result = registrationSchema.safeParse({
      email: longEmail,
      password: validPassword,
      confirmPassword: validPassword,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'auth.common.errors.emailTooLong'),
      ).toBe(true)
    }
  })

  it('rejects a new password longer than 128 characters', () => {
    const result = registrationSchema.safeParse({
      email: 'user@example.com',
      password: longPassword,
      confirmPassword: longPassword,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'auth.common.errors.passwordTooLong'),
      ).toBe(true)
    }
  })
})

describe('passwordResetSchema', () => {
  it('accepts a trimmed valid email', () => {
    expect(passwordResetSchema.parse({ email: ' user@example.com ' })).toEqual({
      email: 'user@example.com',
    })
  })

  it('rejects an invalid email', () => {
    const result = passwordResetSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.emailInvalid',
        path: ['email'],
      })
    }
  })

  it('rejects an empty email', () => {
    expect(passwordResetSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching new passwords', () => {
    expect(
      resetPasswordSchema.parse({ password: validPassword, confirmPassword: validPassword }),
    ).toEqual({
      password: validPassword,
      confirmPassword: validPassword,
    })
  })

  it('rejects a short password and mismatched confirmation independently', () => {
    const short = resetPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    })
    expect(short.success).toBe(false)
    if (!short.success) {
      expect(
        short.error.issues.some((issue) => issue.message === 'auth.common.errors.passwordTooShort'),
      ).toBe(true)
    }

    const mismatch = resetPasswordSchema.safeParse({
      password: validPassword,
      confirmPassword: 'not-the-same1',
    })
    expect(mismatch.success).toBe(false)
    if (!mismatch.success) {
      expect(issueMessages(mismatch)).toContainEqual({
        message: 'auth.common.errors.passwordMismatch',
        path: ['confirmPassword'],
      })
    }
  })
})

describe('updatePasswordSchema', () => {
  it('accepts current and matching new passwords', () => {
    expect(
      updatePasswordSchema.parse({
        currentPassword: 'old-password1',
        password: validPassword,
        confirmPassword: validPassword,
      }),
    ).toEqual({
      currentPassword: 'old-password1',
      password: validPassword,
      confirmPassword: validPassword,
    })
  })

  it('rejects an empty current password', () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: '',
      password: validPassword,
      confirmPassword: validPassword,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordRequired',
        path: ['currentPassword'],
      })
    }
  })

  it('rejects a short new password', () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: 'old-password1',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === 'auth.common.errors.passwordTooShort',
        ),
      ).toBe(true)
    }
  })

  it('rejects mismatched confirmation', () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: 'old-password1',
      password: validPassword,
      confirmPassword: 'different-pass',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issueMessages(result)).toContainEqual({
        message: 'auth.common.errors.passwordMismatch',
        path: ['confirmPassword'],
      })
    }
  })
})
