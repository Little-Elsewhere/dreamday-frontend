import { describe, expect, it } from 'vitest'

import { readSearchParam } from '@/features/auth/utils/search-params'

describe('readSearchParam', () => {
  it('returns a non-empty string value', () => {
    expect(readSearchParam('token-value')).toBe('token-value')
  })

  it('returns the first non-empty array entry', () => {
    expect(readSearchParam(['first', 'second'])).toBe('first')
  })

  it('returns undefined for missing or empty values', () => {
    expect(readSearchParam(undefined)).toBeUndefined()
    expect(readSearchParam('')).toBeUndefined()
    expect(readSearchParam([])).toBeUndefined()
    expect(readSearchParam([''])).toBeUndefined()
  })
})
