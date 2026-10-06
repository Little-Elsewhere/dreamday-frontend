'use server'

import { db } from '@/lib/db'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { requireTripRole } from '@/features/trips/data/access'
import { budgetSchema, expenseSchema } from '@/features/trips/schemas/fund'
import { parseMinorUnits, splitEvenly } from '@/features/trips/utils/money'
import { handleTripActionError, refreshTrip } from './shared'

export const addExpense = async (formData: FormData): Promise<ActionResult<null>> => {
  const value = expenseSchema.parse({
    ...Object.fromEntries(formData),
    splitMembershipIds: formData.getAll('splitMembershipIds'),
  })
  try {
    const { userId } = await requireTripRole(value.tripId, ['owner', 'editor', 'member'])
    const trip = await db.trip.findUniqueOrThrow({ where: { id: value.tripId } })
    const amountMinor = parseMinorUnits(value.amount, trip.currencyExponent)
    if (amountMinor <= 0n) return messageError('invalidAmount')
    const splitIds = [...new Set(value.splitMembershipIds)].sort()
    const members = await db.tripMembership.findMany({
      where: { tripId: value.tripId, id: { in: [value.paidByMembershipId, ...splitIds] } },
    })
    if (members.length !== new Set([value.paidByMembershipId, ...splitIds]).size)
      return messageError('notFound')
    const splits = splitEvenly(amountMinor, splitIds)
    await db.$transaction(async (tx) => {
      await tx.tripExpense.create({
        data: {
          tripId: value.tripId,
          title: value.title,
          amountMinor,
          paidByMembershipId: value.paidByMembershipId,
          incurredAt: new Date(),
          createdBy: userId,
          splits: {
            create: splits.map((split) => ({
              tripId: value.tripId,
              membershipId: split.membershipId,
              amountMinor: split.amountMinor,
            })),
          },
        },
      })
    })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}

export const setBudget = async (formData: FormData): Promise<ActionResult<null>> => {
  const value = budgetSchema.parse(Object.fromEntries(formData))
  try {
    await requireTripRole(value.tripId, ['owner', 'editor'])
    const trip = await db.trip.findUniqueOrThrow({ where: { id: value.tripId } })
    const amount = value.amount ? parseMinorUnits(value.amount, trip.currencyExponent) : null
    await db.tripFund.update({ where: { tripId: value.tripId }, data: { budgetMinor: amount } })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}
