import { describe, expect, it } from 'vitest'

import type { TripCardResponse, TripDetailResponse } from '@/features/trips/schemas/api'
import { mapTripCard, mapTripDetail, mapTripDraft } from '@/features/trips/utils/map-trip'

const tripId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

const baseCard = (overrides: Partial<TripCardResponse> = {}): TripCardResponse => ({
  id: tripId,
  name: 'Tokyo',
  destination: 'Japan',
  description: 'Spring',
  start_date: '2026-04-01',
  end_date: '2026-04-05',
  pace: 'balanced',
  timezone: 'Asia/Tokyo',
  lifecycle: 'published',
  visibility: 'private',
  cover_url: null,
  status: 'upcoming',
  duration_days: 5,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  published_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const baseDetail = (overrides: Partial<TripDetailResponse> = {}): TripDetailResponse => ({
  ...baseCard(),
  note: 'Pack light',
  cover_path: null,
  activities: [],
  ...overrides,
})

describe('mapTrip*', () => {
  it('maps list cover_url presence to the same-origin proxy path', () => {
    const mapped = mapTripCard(
      baseCard({ cover_url: `/api/v1/trips/${tripId}/cover`, visibility: 'public' }),
    )

    expect(mapped.coverUrl).toBe(`/api/trips/${tripId}/cover`)
    expect(mapped.visibility).toBe('public')
  })

  it('leaves coverUrl null when the trip has no cover', () => {
    expect(mapTripCard(baseCard({ cover_url: null })).coverUrl).toBeNull()
    expect(mapTripDraft(baseDetail()).coverUrl).toBeNull()
  })

  it('maps draft covers from cover_path even when cover_url is null', () => {
    const mapped = mapTripDraft(
      baseDetail({
        cover_path: `trips/${tripId}/cover.jpg`,
        cover_url: null,
        visibility: 'private',
      }),
    )

    expect(mapped.coverUrl).toBe(`/api/trips/${tripId}/cover`)
    expect(mapped.coverPath).toBe(`trips/${tripId}/cover.jpg`)
    expect(mapped.visibility).toBe('private')
  })

  it('preserves activities when mapping detail', () => {
    const mapped = mapTripDetail(
      baseDetail({
        activities: [
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            title: 'Temple',
            activity_date: '2026-04-02',
            activity_type: 'explore',
            start_minute: 600,
            end_minute: 720,
            note: '',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    )

    expect(mapped.activities).toEqual([
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        title: 'Temple',
        activityDate: '2026-04-02',
        activityType: 'explore',
        startMinute: 600,
        endMinute: 720,
        note: '',
      },
    ])
  })
})
