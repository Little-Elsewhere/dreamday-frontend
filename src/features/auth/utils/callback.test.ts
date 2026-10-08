import { describe, expect, it } from 'vitest'

import { Locale } from '@/constants/locale'
import { getConfirmationRedirect } from '@/features/auth/utils/callback'

describe('getConfirmationRedirect', () => {
  const appUrl = 'https://dreamday.example'
  const getRedirect = (next?: string) => getConfirmationRedirect(appUrl, Locale.EN, next)

  it('preserves a local redirect path', () => {
    expect(getRedirect('/account?tab=trips')).toEqual({ href: '/account?tab=trips', locale: 'en' })
  })

  it('accepts the same-origin redirect URL passed by Supabase and keeps its locale', () => {
    expect(getRedirect('https://dreamday.example/vi/auth/update-password')).toEqual({
      href: '/auth/update-password',
      locale: Locale.VI,
    })
  })

  it.each(['https://example.com', '//example.com', '/\\example.com'])(
    'falls back to the app root for an unsafe redirect: %s',
    (next) => {
      expect(getRedirect(next)).toEqual({ href: '/', locale: Locale.EN })
    },
  )

  it('defaults to the app root when next is missing', () => {
    expect(getRedirect()).toEqual({ href: '/', locale: Locale.EN })
  })
})
