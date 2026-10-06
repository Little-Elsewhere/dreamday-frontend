'use server'

import { db } from '@/lib/db'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { requireTripRole } from '@/features/trips/data/access'
import { scheduleSchema } from '@/features/trips/schemas/schedule'
import { localToInstant } from '@/features/trips/utils/time'
import { handleTripActionError, refreshTrip } from './shared'

export const addSchedule = async (formData: FormData): Promise<ActionResult<null>> => {
  const raw = Object.fromEntries(formData)
  const value = scheduleSchema.parse({
    ...raw,
    endLocal: raw.endLocal || undefined,
    startFold: raw.startFold || undefined,
    endFold: raw.endFold || undefined,
  })
  try {
    const { userId } = await requireTripRole(value.tripId, ['owner', 'editor'])
    const trip = await db.trip.findUniqueOrThrow({ where: { id: value.tripId } })
    if (
      value.tripDay < trip.startsOn.toISOString().slice(0, 10) ||
      value.tripDay > trip.endsOn.toISOString().slice(0, 10)
    )
      return messageError('outsideTrip')
    const startsAt = localToInstant(value.startLocal, value.startTimeZone, value.startFold)
    const endsAt = value.endLocal
      ? localToInstant(value.endLocal, value.endTimeZone, value.endFold)
      : null
    if (endsAt && endsAt <= startsAt) return messageError('endBeforeStart')
    await db.tripScheduleItem.create({
      data: {
        tripId: value.tripId,
        title: value.title,
        note: value.note,
        location: value.location,
        tripDay: new Date(`${value.tripDay}T00:00:00Z`),
        startsAt,
        endsAt,
        startTimeZone: value.startTimeZone,
        endTimeZone: value.endTimeZone,
        createdBy: userId,
      },
    })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}
