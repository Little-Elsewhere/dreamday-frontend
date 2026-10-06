import { describe, expect, it } from 'vitest'

import {
  formatMinute,
  getAppDate,
  getTripDuration,
  getTripStatus,
  parseMinute,
} from '@/features/trips/utils/trip'

describe('trip date and time utilities', () => {
  it('formats app dates in the configured Ho Chi Minh timezone', () => {
    expect(getAppDate(new Date('2026-10-05T17:30:00.000Z'))).toBe('2026-10-06')
  })

  it('classifies a trip ending today as upcoming and an earlier trip as past', () => {
    expect(getTripStatus('2026-10-06', '2026-10-06')).toBe('upcoming')
    expect(getTripStatus('2026-10-05', '2026-10-06')).toBe('past')
  })

  it('counts both the departure and return calendar day', () => {
    expect(getTripDuration('2026-10-11', '2026-10-11')).toBe(1)
    expect(getTripDuration('2026-10-11', '2026-10-13')).toBe(3)
  })

  it('parses and formats quarter-hour times including 24:00', () => {
    expect(parseMinute('09:15')).toBe(555)
    expect(parseMinute('24:00', true)).toBe(1440)
    expect(parseMinute('24:00')).toBe(Number.NaN)
    expect(formatMinute(1440)).toBe('24:00')
  })
})
