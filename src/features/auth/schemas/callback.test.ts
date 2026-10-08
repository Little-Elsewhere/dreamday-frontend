import { describe, expect, it } from 'vitest'

import { AuthEmailOtpType } from '@/features/auth/constants/auth'
import { confirmationSchema, emailOtpTypeSchema } from '@/features/auth/schemas/callback'

describe('emailOtpTypeSchema', () => {
  it('accepts every supported OTP type', () => {
    for (const type of Object.values(AuthEmailOtpType)) {
      expect(emailOtpTypeSchema.parse(type)).toBe(type)
    }
  })

  it('rejects unsupported OTP types', () => {
    expect(emailOtpTypeSchema.safeParse('unknown').success).toBe(false)
  })
})

describe('confirmation schema', () => {
  it('parses valid confirmation data with an optional redirect', () => {
    const parsed = confirmationSchema.parse({
      token_hash: 'valid-token',
      type: AuthEmailOtpType.Signup,
    })

    expect(parsed.token_hash).toBe('valid-token')
    expect(parsed.type).toBe(AuthEmailOtpType.Signup)
    expect(parsed.next).toBeUndefined()
  })

  it('ignores an invalid redirect value', () => {
    const parsed = confirmationSchema.parse({
      token_hash: 'valid-token',
      type: AuthEmailOtpType.Signup,
      next: 'a'.repeat(2049),
    })

    expect(parsed.next).toBeUndefined()
  })
})
