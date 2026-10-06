'use server'

import { getTranslations } from 'next-intl/server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { requireTripRole, TripPermissionError } from '@/features/trips/data/access'
import {
  createTripSchema,
  currencyExponents,
  updateTripSchema,
} from '@/features/trips/schemas/trip'
import { handleTripActionError, refreshTrip } from './shared'

export const createTrip = async (formData: FormData): Promise<ActionResult<{ id: string }>> => {
  const value = createTripSchema.parse(Object.fromEntries(formData))
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user?.email) throw new TripPermissionError()
    const t = await getTranslations('trips')
    const userId = user.id
    const trip = await db.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          displayName:
            (typeof user.user_metadata.full_name === 'string'
              ? user.user_metadata.full_name.trim().slice(0, 100)
              : '') || user.email!,
          emailNormalized: user.email!.toLowerCase(),
        },
        update: { emailNormalized: user.email!.toLowerCase() },
      })
      return tx.trip.create({
        data: {
          ownerId: userId,
          name: value.name,
          destination: value.destination,
          description: value.description,
          startsOn: new Date(`${value.startsOn}T00:00:00Z`),
          endsOn: new Date(`${value.endsOn}T00:00:00Z`),
          timeZone: value.timeZone,
          currencyCode: value.currencyCode,
          currencyExponent: currencyExponents[value.currencyCode],
          memberships: { create: { userId, role: 'owner' } },
          checklists: { create: { title: t('checklists.labels.defaultTitle'), position: 0 } },
          fund: { create: {} },
        },
      })
    })
    refreshTrip()
    return { success: true, data: { id: trip.id } }
  } catch (error) {
    return handleTripActionError(error)
  }
}

export const updateTrip = async (formData: FormData): Promise<ActionResult<null>> => {
  const value = updateTripSchema.parse(Object.fromEntries(formData))
  try {
    await requireTripRole(value.tripId, ['owner', 'editor'])
    const existing = await db.trip.findUniqueOrThrow({
      where: { id: value.tripId },
      include: { fund: { include: { expenses: { take: 1 } } } },
    })
    if (existing.fund?.expenses.length && existing.currencyCode !== value.currencyCode)
      return messageError('currencyLocked')
    await db.trip.update({
      where: { id: value.tripId },
      data: {
        name: value.name,
        destination: value.destination,
        description: value.description,
        startsOn: new Date(`${value.startsOn}T00:00:00Z`),
        endsOn: new Date(`${value.endsOn}T00:00:00Z`),
        timeZone: value.timeZone,
        currencyCode: value.currencyCode,
        currencyExponent: currencyExponents[value.currencyCode],
        updatedAt: new Date(),
      },
    })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}
