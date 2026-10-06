export const timeZones = [
  ...new Set([
    'Asia/Ho_Chi_Minh',
    'Asia/Tokyo',
    'Europe/London',
    'America/New_York',
    ...Intl.supportedValuesOf('timeZone'),
  ]),
].sort()
