import { describe, expect, it } from 'vitest'

import { getLocaleFromPathname, removeLocalePrefix } from '@/utils/locale'

describe('getLocaleFromPathname', () => {
  it('detects a supported locale segment', () => {
    expect(getLocaleFromPathname('/vi/trips')).toBe('vi')
  })

  it('uses the default locale when the first segment is not a locale', () => {
    expect(getLocaleFromPathname('/video')).toBe('en')
  })

  it('removes only supported locale prefixes', () => {
    expect(removeLocalePrefix('/vi/trips')).toBe('/trips')
    expect(removeLocalePrefix('/en')).toBe('/')
    expect(removeLocalePrefix('/video/trips')).toBe('/video/trips')
  })
})
