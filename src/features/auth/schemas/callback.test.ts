import { describe, expect, it } from 'vitest'

import { Locale } from '@/constants/locale'
import { AuthEmailOtpType } from '@/features/auth/constants/auth'
import { confirmationSchema, getConfirmationRedirect } from '@/features/auth/schemas/callback'

describe('confirmation schema', () => {
  const appUrl = 'https://dreamday.example'
  const parseNext = (next?: string) => {
    const parsed = confirmationSchema.parse({
      token_hash: 'valid-token',
      type: AuthEmailOtpType.Signup,
      next,
    })
    return getConfirmationRedirect(parsed.next, appUrl, Locale.EN)
  }

  it('preserves a local redirect path', () => {
    expect(parseNext('/account?tab=trips')).toEqual({ href: '/account?tab=trips', locale: 'en' })
  })

  it('accepts the same-origin redirect URL passed by Supabase and keeps its locale', () => {
    expect(parseNext('https://dreamday.example/vi/auth/update-password')).toEqual({
      href: '/auth/update-password',
      locale: Locale.VI,
    })
  })

  it.each(['https://example.com', '//example.com', '/\\example.com'])(
    'falls back to the app root for an unsafe redirect: %s',
    (next) => {
      expect(parseNext(next)).toEqual({ href: '/', locale: Locale.EN })
    },
  )

  it('defaults to the app root when next is missing', () => {
    expect(parseNext()).toEqual({ href: '/', locale: Locale.EN })
  })
})
