import { describe, expect, it } from 'vitest'

import { utcInstantSchema } from '@/schemas/datetime'

describe('utcInstantSchema', () => {
  it('accepts UTC ISO-8601 instants with a Z suffix', () => {
    expect(utcInstantSchema.parse('2026-10-30T02:15:00Z')).toBe('2026-10-30T02:15:00Z')
    expect(utcInstantSchema.parse('2026-10-30T02:15:00.000Z')).toBe('2026-10-30T02:15:00.000Z')
  })

  it('rejects date-only, naive, and offset datetimes', () => {
    expect(utcInstantSchema.safeParse('2026-10-30').success).toBe(false)
    expect(utcInstantSchema.safeParse('2026-10-30T02:15:00').success).toBe(false)
    expect(utcInstantSchema.safeParse('2026-10-30T09:15:00+07:00').success).toBe(false)
  })
})
