import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  passwordResetSchema,
  registrationSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@/features/auth/schemas/auth'

const issueMessages = (result: { success: false; error: { issues: { message: string }[] } }) =>
  result.error.issues.map((issue) => issue.message)

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid email and password', () => {
      expect(
        loginSchema.safeParse({ email: 'traveler@example.com', password: 'any-password' }).success,
      ).toBe(true)
    })

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({ email: 'traveler@example.com', password: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.passwordRequired')
      }
    })

    it('rejects an invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.emailInvalid')
      }
    })

    it('rejects an email longer than 254 characters', () => {
      const result = loginSchema.safeParse({
        email: `${'a'.repeat(250)}@example.com`,
        password: 'password',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.emailTooLong')
      }
    })
  })

  describe('registrationSchema', () => {
    it('accepts a matching password pair of at least 12 characters', () => {
      expect(
        registrationSchema.safeParse({
          email: 'new@example.com',
          password: 'Password12345',
          confirmPassword: 'Password12345',
        }).success,
      ).toBe(true)
    })

    it('rejects a short password', () => {
      const result = registrationSchema.safeParse({
        email: 'new@example.com',
        password: 'short',
        confirmPassword: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.passwordTooShort')
      }
    })

    it('rejects mismatched confirmation passwords', () => {
      const result = registrationSchema.safeParse({
        email: 'new@example.com',
        password: 'Password12345',
        confirmPassword: 'Password99999',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.passwordMismatch')
      }
    })

    it('rejects a missing confirmation password', () => {
      const result = registrationSchema.safeParse({
        email: 'new@example.com',
        password: 'Password12345',
        confirmPassword: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.confirmPasswordRequired')
      }
    })
  })

  describe('passwordResetSchema', () => {
    it('requires a valid email', () => {
      expect(passwordResetSchema.safeParse({ email: 'ok@example.com' }).success).toBe(true)
      expect(passwordResetSchema.safeParse({ email: 'bad' }).success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('accepts a valid new password pair', () => {
      expect(
        resetPasswordSchema.safeParse({
          password: 'Password12345',
          confirmPassword: 'Password12345',
        }).success,
      ).toBe(true)
    })

    it('rejects mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'Password12345',
        confirmPassword: 'Different1234',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.passwordMismatch')
      }
    })
  })

  describe('updatePasswordSchema', () => {
    it('accepts current and matching new passwords', () => {
      expect(
        updatePasswordSchema.safeParse({
          currentPassword: 'OldPassword12',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        }).success,
      ).toBe(true)
    })

    it('rejects an empty current password', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: '',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(issueMessages(result)).toContain('auth.common.errors.passwordRequired')
      }
    })
  })
})
