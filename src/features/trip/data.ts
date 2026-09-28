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
}

export const trips: Trip[] = [
  {
    id: 'da-lat-thang-muoi',
    status: 'planning',
  },
  {
    id: 'hoi-an-cuoi-thu',
    status: 'upcoming',
  },
  {
    id: 'lan-ha-thang-bay',
    status: 'past',
  },
  {
    id: 'da-lat-cuoi-nam',
    status: 'planning',
  },
  {
    id: 'hoi-an-ben-song',
    status: 'past',
  },
  {
    id: 'lan-ha-dau-nam',
    status: 'upcoming',
  },
]
