'use server'

import { db } from '@/lib/db'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { requireTripRole } from '@/features/trips/data/access'
import { checklistSchema, taskSchema, taskToggleSchema } from '@/features/trips/schemas/checklist'
import { localToInstant } from '@/features/trips/utils/time'
import { handleTripActionError, refreshTrip } from './shared'

export const addChecklist = async (formData: FormData): Promise<ActionResult<null>> => {
  const value = checklistSchema.parse(Object.fromEntries(formData))
  try {
    await requireTripRole(value.tripId, ['owner', 'editor'])
    await db.tripChecklist.create({ data: { tripId: value.tripId, title: value.title } })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}

export const addTask = async (formData: FormData): Promise<ActionResult<null>> => {
  const raw = Object.fromEntries(formData)
  const value = taskSchema.parse({
    ...raw,
    assigneeMembershipId: raw.assigneeMembershipId || undefined,
    dueLocal: raw.dueLocal || undefined,
    dueTimeZone: raw.dueTimeZone || undefined,
  })
  try {
    const { userId } = await requireTripRole(value.tripId, ['owner', 'editor', 'member'])
    const checklist = await db.tripChecklist.findUnique({
      where: { tripId_id: { tripId: value.tripId, id: value.checklistId } },
    })
    if (!checklist) return messageError('notFound')
    if (value.assigneeMembershipId) {
      const assignee = await db.tripMembership.findUnique({
        where: { tripId_id: { tripId: value.tripId, id: value.assigneeMembershipId } },
      })
      if (!assignee) return messageError('notFound')
    }
    const dueAt =
      value.dueLocal && value.dueTimeZone
        ? localToInstant(value.dueLocal, value.dueTimeZone, value.dueFold)
        : null
    await db.tripTask.create({
      data: {
        tripId: value.tripId,
        checklistId: value.checklistId,
        title: value.title,
        assigneeMembershipId: value.assigneeMembershipId,
        dueAt,
        dueTimeZone: dueAt ? value.dueTimeZone : null,
        createdBy: userId,
      },
    })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}

export const toggleTask = async (formData: FormData): Promise<ActionResult<null>> => {
  const value = taskToggleSchema.parse({
    ...Object.fromEntries(formData),
    isDone: formData.get('isDone') === 'true',
  })
  try {
    const actor = await requireTripRole(value.tripId, ['owner', 'editor', 'member'])
    const task = await db.tripTask.findUnique({ where: { id: value.taskId } })
    if (!task || task.tripId !== value.tripId) return messageError('notFound')
    if (
      actor.role === 'member' &&
      task.assigneeMembershipId !== actor.membershipId &&
      task.createdBy !== actor.userId
    )
      return messageError('forbidden')
    await db.tripTask.update({
      where: { id: value.taskId },
      data: { isDone: value.isDone, completedAt: value.isDone ? new Date() : null },
    })
    refreshTrip()
    return { success: true, data: null }
  } catch (error) {
    return handleTripActionError(error)
  }
}
