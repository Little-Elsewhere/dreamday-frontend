export class InvalidLocalTimeError extends Error {
  constructor(public readonly reason: 'gap' | 'fold') {
    super(reason)
  }
}

const components = (date: Date, zone: string): number[] => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value)
  return [get('year'), get('month'), get('day'), get('hour'), get('minute'), get('second')]
}

export const localToInstant = (local: string, zone: string, fold?: 'earlier' | 'later'): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(local)
  if (!match) throw new InvalidLocalTimeError('gap')
  const target = match.slice(1).map((part) => Number(part ?? '0'))
  const naive = Date.UTC(target[0], target[1] - 1, target[2], target[3], target[4], target[5])
  if (components(new Date(naive), 'UTC').some((value, index) => value !== target[index])) {
    throw new InvalidLocalTimeError('gap')
  }
  const offsets = new Set<number>()
  for (const delta of [-36, -24, -12, 0, 12, 24, 36]) {
    const point = naive + delta * 3_600_000
    const localParts = components(new Date(point), zone)
    offsets.add(
      (Date.UTC(
        localParts[0],
        localParts[1] - 1,
        localParts[2],
        localParts[3],
        localParts[4],
        localParts[5],
      ) -
        point) /
        60_000,
    )
  }
  const candidates = [...offsets]
    .map((offset) => naive - offset * 60_000)
    .filter((point) =>
      components(new Date(point), zone).every((value, index) => value === target[index]),
    )
    .sort((a, b) => a - b)
  if (candidates.length === 0) throw new InvalidLocalTimeError('gap')
  if (candidates.length > 1 && !fold) throw new InvalidLocalTimeError('fold')
  return new Date(fold === 'later' ? candidates[candidates.length - 1] : candidates[0])
}
