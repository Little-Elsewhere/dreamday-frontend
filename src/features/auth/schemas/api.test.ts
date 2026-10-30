import { describe, expect, it } from 'vitest'

import { tokenResponseSchema, userResponseSchema } from '@/features/auth/schemas/api'

const validTokenResponse = {
  access_token: 'access-token',
  token_type: 'bearer' as const,
  expires_in: 900,
  refresh_token: 'refresh-token',
  refresh_expires_in: 604_800,
}

const validUser = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  email: 'user@example.com',
  is_email_verified: true,
  created_at: '2026-10-30T02:15:00Z',
}

describe('tokenResponseSchema', () => {
  it('accepts a bearer token payload', () => {
    expect(tokenResponseSchema.parse(validTokenResponse)).toEqual(validTokenResponse)
  })

  it('rejects an empty access token', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        access_token: '',
      }).success,
    ).toBe(false)
  })

  it('rejects an empty refresh token', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        refresh_token: '',
      }).success,
    ).toBe(false)
  })

  it('rejects a non-bearer token type', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        token_type: 'mac',
      }).success,
    ).toBe(false)
  })

  it('rejects non-positive expires_in values', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        expires_in: 0,
      }).success,
    ).toBe(false)
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        expires_in: -1,
      }).success,
    ).toBe(false)
  })

  it('rejects non-positive refresh_expires_in values', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        refresh_expires_in: 0,
      }).success,
    ).toBe(false)
  })

  it('rejects a fractional expires_in', () => {
    expect(
      tokenResponseSchema.safeParse({
        ...validTokenResponse,
        expires_in: 900.5,
      }).success,
    ).toBe(false)
  })
})

describe('userResponseSchema', () => {
  it('accepts a user payload with a UTC created_at instant', () => {
    expect(userResponseSchema.parse(validUser)).toEqual(validUser)
  })

  it('accepts a fractional-second UTC instant', () => {
    expect(
      userResponseSchema.parse({
        ...validUser,
        created_at: '2026-10-30T02:15:00.123Z',
      }).created_at,
    ).toBe('2026-10-30T02:15:00.123Z')
  })

  it('rejects a malformed user id', () => {
    expect(
      userResponseSchema.safeParse({
        ...validUser,
        id: 'not-a-uuid',
      }).success,
    ).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(
      userResponseSchema.safeParse({
        ...validUser,
        email: 'not-an-email',
      }).success,
    ).toBe(false)
  })

  it('rejects offset, naive, and date-only created_at values', () => {
    expect(
      userResponseSchema.safeParse({
        ...validUser,
        created_at: '2026-10-30T09:15:00+07:00',
      }).success,
    ).toBe(false)
    expect(
      userResponseSchema.safeParse({
        ...validUser,
        created_at: '2026-10-30T02:15:00',
      }).success,
    ).toBe(false)
    expect(
      userResponseSchema.safeParse({
        ...validUser,
        created_at: '2026-10-30',
      }).success,
    ).toBe(false)
  })
})
