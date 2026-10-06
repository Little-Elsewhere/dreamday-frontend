import { describe, expect, it } from 'vitest'

import { InvalidLocalTimeError, localToInstant } from './time'

describe('trip local time conversion', () => {
  it('uses the activity zone rather than the browser or trip zone', () => {
    expect(localToInstant('2026-10-10T09:00', 'Asia/Tokyo').toISOString()).toBe(
      '2026-10-10T00:00:00.000Z',
    )
    expect(localToInstant('2026-10-10T09:00', 'Asia/Ho_Chi_Minh').toISOString()).toBe(
      '2026-10-10T02:00:00.000Z',
    )
  })
  it('rejects a daylight saving gap', () => {
    expect(() => localToInstant('2026-03-08T02:30', 'America/New_York')).toThrowError(
      InvalidLocalTimeError,
    )
  })
  it('requires a choice for a daylight saving fold', () => {
    expect(() => localToInstant('2026-11-01T01:30', 'America/New_York')).toThrowError(
      InvalidLocalTimeError,
    )
    expect(localToInstant('2026-11-01T01:30', 'America/New_York', 'earlier').toISOString()).toBe(
      '2026-11-01T05:30:00.000Z',
    )
    expect(localToInstant('2026-11-01T01:30', 'America/New_York', 'later').toISOString()).toBe(
      '2026-11-01T06:30:00.000Z',
    )
  })
  it('can order a flight across the international date line', () => {
    const departure = localToInstant('2026-10-10T23:00', 'Asia/Tokyo')
    const arrival = localToInstant('2026-10-10T17:00', 'America/Los_Angeles')
    expect(arrival.getTime()).toBeGreaterThan(departure.getTime())
  })
})
