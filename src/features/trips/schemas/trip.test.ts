import { describe, expect, it } from 'vitest'

import {
  deleteTripActivitySchema,
  publishTripFieldsSchema,
  tripActivitySchema,
  tripDraftSchema,
  tripIdSchema,
  tripNoteSchema,
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

const validActivity = {
  tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  title: 'Late arrival',
  activityDate: '2026-10-11',
  activityType: 'travel' as const,
  startMinute: 1425,
  endMinute: 1440,
  note: '',
}

describe('trip schemas', () => {
  it('rejects malformed trip IDs before they reach database queries', () => {
    expect(tripIdSchema.safeParse('not-a-uuid').success).toBe(false)
    expect(tripIdSchema.safeParse('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa').success).toBe(true)
  })

  it('allows incomplete data to be saved as a draft', () => {
    expect(tripDraftSchema.parse(blankDraft)).toMatchObject({ name: '', startDate: '', pace: '' })
  })

  it('rejects draft dates when return is before departure', () => {
    const result = tripDraftSchema.safeParse({
      ...blankDraft,
      startDate: '2026-10-12',
      endDate: '2026-10-11',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('trips.create.errors.endBeforeStart')
    }
  })

  it('rejects draft fields that exceed max length', () => {
    expect(tripDraftSchema.safeParse({ ...blankDraft, name: 'n'.repeat(41) }).success).toBe(false)
    expect(tripDraftSchema.safeParse({ ...blankDraft, destination: 'd'.repeat(41) }).success).toBe(
      false,
    )
    expect(tripDraftSchema.safeParse({ ...blankDraft, description: 'x'.repeat(101) }).success).toBe(
      false,
    )
    expect(tripDraftSchema.safeParse({ ...blankDraft, note: 'n'.repeat(1001) }).success).toBe(false)
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

  it('accepts a valid publish payload including same-day trips', () => {
    expect(
      publishTripFieldsSchema.safeParse({
        name: 'Weekend away',
        startDate: '2026-10-11',
        endDate: '2026-10-12',
        pace: 'relaxed',
      }).success,
    ).toBe(true)
    expect(
      publishTripFieldsSchema.safeParse({
        name: 'Day trip',
        startDate: '2026-10-11',
        endDate: '2026-10-11',
        pace: 'active',
      }).success,
    ).toBe(true)
  })

  it('accepts a 15 minute activity ending at midnight', () => {
    expect(tripActivitySchema.safeParse(validActivity).success).toBe(true)
  })

  it('rejects zero-length or reversed activity times', () => {
    const result = tripActivitySchema.safeParse({
      ...validActivity,
      startMinute: 600,
      endMinute: 600,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('trips.create.errors.endTimeBeforeStart')
    }
  })

  it('rejects blank activity titles and unknown activity types', () => {
    expect(tripActivitySchema.safeParse({ ...validActivity, title: '  ' }).success).toBe(false)
    expect(tripActivitySchema.safeParse({ ...validActivity, activityType: 'flying' }).success).toBe(
      false,
    )
  })

  it('rejects activity notes longer than 500 characters', () => {
    expect(tripActivitySchema.safeParse({ ...validActivity, note: 'n'.repeat(501) }).success).toBe(
      false,
    )
  })

  it('validates delete activity and note payloads', () => {
    expect(
      deleteTripActivitySchema.safeParse({
        tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        activityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      }).success,
    ).toBe(true)
    expect(
      deleteTripActivitySchema.safeParse({
        tripId: 'bad',
        activityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      }).success,
    ).toBe(false)
    expect(
      tripNoteSchema.safeParse({
        tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        note: 'Pack light',
      }).success,
    ).toBe(true)
    expect(
      tripNoteSchema.safeParse({
        tripId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        note: 'n'.repeat(1001),
      }).success,
    ).toBe(false)
  })
})
