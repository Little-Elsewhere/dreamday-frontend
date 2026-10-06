export const formatMinor = (
  minor: bigint,
  code: string,
  exponent: number,
  locale: string,
): string => {
  const divisor = 10n ** BigInt(exponent)
  const absolute = minor < 0n ? -minor : minor
  const whole = absolute / divisor
  const fraction = absolute % divisor
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  })
  return formatter
    .formatToParts(minor < 0n ? -whole : whole)
    .map((part) =>
      part.type === 'fraction' ? fraction.toString().padStart(exponent, '0') : part.value,
    )
    .join('')
    .replace(/^/, minor < 0n && whole === 0n ? '-' : '')
}

export const parseMinorUnits = (value: string, exponent: number): bigint => {
  if (!/^\d+(?:\.\d+)?$/.test(value)) throw new Error('invalidAmount')
  const [whole, fraction = ''] = value.split('.')
  if (fraction.length > exponent) throw new Error('invalidAmount')
  const minor =
    BigInt(whole) * 10n ** BigInt(exponent) + BigInt(fraction.padEnd(exponent, '0') || '0')
  if (minor > 9_223_372_036_854_775_807n) throw new Error('invalidAmount')
  return minor
}

export const splitEvenly = (
  amountMinor: bigint,
  membershipIds: string[],
): { membershipId: string; amountMinor: bigint }[] => {
  const ids = [...new Set(membershipIds)].sort()
  if (amountMinor <= 0n || ids.length === 0) throw new Error('invalidAmount')
  const quotient = amountMinor / BigInt(ids.length)
  const remainder = amountMinor % BigInt(ids.length)
  return ids.map((membershipId, index) => ({
    membershipId,
    amountMinor: quotient + (BigInt(index) < remainder ? 1n : 0n),
  }))
}

export const minorUnitStep = (exponent: number): string =>
  exponent === 0 ? '1' : `0.${'0'.repeat(exponent - 1)}1`
