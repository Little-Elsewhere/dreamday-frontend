import { describe, expect, it } from 'vitest'

import {
  publishTripFieldsSchema,
  tripActivitySchema,
  tripDraftSchema,
} from '@/features/trips/schemas/trip'

const blankDraft = {
  name: '',
  destination: '',
  description: '',
  startDate: '',
  endDate: '',
  pace: '',
  coverPath: null,
  note: '',
}

describe('trip schemas', () => {
  it('allows incomplete data to be saved as a draft', () => {
    expect(tripDraftSchema.parse(blankDraft)).toMatchObject({ name: '', startDate: '', pace: '' })
  })

  it('requires a name, dates, and pace before publishing', () => {
    const result = publishTripFieldsSchema.safeParse({
      name: ' ',
      startDate: null,
      endDate: null,
      pace: null,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a return date earlier than departure', () => {
    const result = publishTripFieldsSchema.safeParse({
      name: 'Weekend away',
      startDate: '2026-10-12',
      endDate: '2026-10-11',
      pace: 'balanced',
    })
    expect(result.success).toBe(false)
    if (!result.success)
      expect(result.error.issues[0]?.message).toBe('trips.create.errors.endBeforeStart')
  })

  it('accepts a valid publish payload', () => {
    expect(
      publishTripFieldsSchema.safeParse({
        name: 'Weekend away',
        startDate: '2026-10-11',
        endDate: '2026-10-12',
        pace: 'relaxed',
      }).success,
    ).toBe(true)
  })

  it('accepts a 15 minute activity ending at midnight', () => {
    expect(
      tripActivitySchema.safeParse({
        tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        title: 'Late arrival',
        activityDate: '2026-10-11',
        activityType: 'travel',
        startMinute: 1425,
        endMinute: 1440,
        note: '',
      }).success,
    ).toBe(true)
  })

  it('rejects zero-length or reversed activity times', () => {
    const result = tripActivitySchema.safeParse({
      tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      title: 'Late arrival',
      activityDate: '2026-10-11',
      activityType: 'travel',
      startMinute: 600,
      endMinute: 600,
      note: '',
    })
    expect(result.success).toBe(false)
  })
})
