import { describe, expect, it } from 'vitest'

import { parseMinorUnits, splitEvenly } from './money'

describe('money in minor units', () => {
  it('preserves zero and two decimal currencies', () => {
    expect(parseMinorUnits('1200', 0)).toBe(1200n)
    expect(parseMinorUnits('12.34', 2)).toBe(1234n)
    expect(() => parseMinorUnits('12.34', 0)).toThrow()
  })
  it('distributes remainders exactly and deterministically', () => {
    const splits = splitEvenly(100n, ['b', 'a', 'c'])
    expect(splits).toEqual([
      { membershipId: 'a', amountMinor: 34n },
      { membershipId: 'b', amountMinor: 33n },
      { membershipId: 'c', amountMinor: 33n },
    ])
    expect(splits.reduce((sum, split) => sum + split.amountMinor, 0n)).toBe(100n)
  })
})
