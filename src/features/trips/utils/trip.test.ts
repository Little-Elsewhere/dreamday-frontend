import { describe, expect, it } from 'vitest'

import type { TripActivity } from '@/features/trips/types/trip'
import {
  createUuidV4,
  formatMinute,
  formatTripDate,
  formatTripDetailDate,
  getAppDate,
  getTripDuration,
  getTripStatus,
  groupTripActivitiesByDate,
  parseMinute,
  sortTripActivities,
} from '@/features/trips/utils/trip'

const createActivity = (id: string, activityDate: string, startMinute: number): TripActivity => ({
  id,
  title: id,
  activityDate,
  activityType: 'explore',
  startMinute,
  endMinute: startMinute + 60,
  note: '',
})

describe('trip date and time utilities', () => {
  it('creates a version 4 UUID using Web Crypto random values', () => {
    expect(createUuidV4()).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
    )
  })

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

  it('keeps activities sorted after date or time edits', () => {
    const activities = [
      createActivity('b', '2026-10-07', 540),
      createActivity('c', '2026-10-06', 600),
      createActivity('a', '2026-10-06', 540),
    ]

    expect(sortTripActivities(activities).map(({ id }) => id)).toEqual(['a', 'c', 'b'])
  })

  it('groups activities in one pass by date', () => {
    const activities = [
      createActivity('a', '2026-10-06', 540),
      createActivity('b', '2026-10-07', 600),
      createActivity('c', '2026-10-06', 720),
    ]

    const groups = groupTripActivitiesByDate(activities)

    expect([...groups.keys()]).toEqual(['2026-10-06', '2026-10-07'])
    expect(groups.get('2026-10-06')?.map(({ id }) => id)).toEqual(['a', 'c'])
  })

  it('formats date-only values without shifting them across timezones', () => {
    expect(formatTripDate('2026-10-06', 'en-US')).toBe('Oct 6, 2026')
    expect(formatTripDetailDate('2026-10-06', 'en-US')).toBe('October 6, 2026')
  })

  it('parses and formats quarter-hour times including 24:00', () => {
    expect(parseMinute('09:15')).toBe(555)
    expect(parseMinute('24:00', true)).toBe(1440)
    expect(parseMinute('24:00')).toBe(Number.NaN)
    expect(formatMinute(1440)).toBe('24:00')
  })
})
