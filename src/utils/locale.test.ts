import { describe, expect, it } from 'vitest'

import { getPathnameLocale, removeLocalePrefix } from '@/utils/locale'

describe('getPathnameLocale', () => {
  it('returns a supported locale from the first pathname segment', () => {
    expect(getPathnameLocale('/vi')).toBe('vi')
    expect(getPathnameLocale('/en')).toBe('en')
    expect(getPathnameLocale('/vi/trips')).toBe('vi')
    expect(getPathnameLocale('/en/trips')).toBe('en')
  })

  it('returns undefined when the first segment is not a locale', () => {
    expect(getPathnameLocale('/video')).toBeUndefined()
    expect(getPathnameLocale('/trips/vi')).toBeUndefined()
    expect(getPathnameLocale('/trips/en')).toBeUndefined()
  })
})

describe('removeLocalePrefix', () => {
  it('removes only supported locale prefixes', () => {
    expect(removeLocalePrefix('/vi/trips')).toBe('/trips')
    expect(removeLocalePrefix('/en')).toBe('/')
    expect(removeLocalePrefix('/video/trips')).toBe('/video/trips')
  })
})
