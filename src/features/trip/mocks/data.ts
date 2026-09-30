export type TripStatus = 'upcoming' | 'planning' | 'past'

export type TripId =
  | 'da-lat-thang-muoi'
  | 'hoi-an-cuoi-thu'
  | 'lan-ha-thang-bay'
  | 'da-lat-cuoi-nam'
  | 'hoi-an-ben-song'
  | 'lan-ha-dau-nam'

export type Trip = {
  id: TripId
  status: TripStatus
  startDate: Date
  endDate: Date
}

export const trips: Trip[] = [
  {
    id: 'da-lat-thang-muoi',
    status: 'planning',
    startDate: new Date('2026-10-18T00:00:00.000Z'),
    endDate: new Date('2026-10-21T00:00:00.000Z'),
  },
  {
    id: 'hoi-an-cuoi-thu',
    status: 'upcoming',
    startDate: new Date('2026-11-02T00:00:00.000Z'),
    endDate: new Date('2026-11-05T00:00:00.000Z'),
  },
  {
    id: 'lan-ha-thang-bay',
    status: 'past',
    startDate: new Date('2026-07-15T00:00:00.000Z'),
    endDate: new Date('2026-07-17T00:00:00.000Z'),
  },
  {
    id: 'da-lat-cuoi-nam',
    status: 'planning',
    startDate: new Date('2026-12-12T00:00:00.000Z'),
    endDate: new Date('2026-12-15T00:00:00.000Z'),
  },
  {
    id: 'hoi-an-ben-song',
    status: 'past',
    startDate: new Date('2026-05-22T00:00:00.000Z'),
    endDate: new Date('2026-05-25T00:00:00.000Z'),
  },
  {
    id: 'lan-ha-dau-nam',
    status: 'upcoming',
    startDate: new Date('2027-01-10T00:00:00.000Z'),
    endDate: new Date('2027-01-13T00:00:00.000Z'),
  },
]
