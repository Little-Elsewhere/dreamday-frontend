export const localDay = (instant: Date, zone: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export const tripStatus = (trip: {
  startsOn: Date
  endsOn: Date
  timeZone: string
  lifecycle: string
}): 'planning' | 'upcoming' | 'ongoing' | 'past' | 'cancelled' => {
  if (trip.lifecycle === 'cancelled') return 'cancelled'
  const today = localDay(new Date(), trip.timeZone)
  if (trip.endsOn.toISOString().slice(0, 10) < today) return 'past'
  if (trip.startsOn.toISOString().slice(0, 10) > today)
    return trip.lifecycle === 'planning' ? 'planning' : 'upcoming'
  return 'ongoing'
}
