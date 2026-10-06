'use server'

import { createHash, randomBytes } from 'node:crypto'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/action-result'
import { messageError } from '@/utils/action-result'
import { requireTripRole, TripPermissionError } from '@/features/trips/data/access'
import { acceptInvitationSchema, invitationSchema } from '@/features/trips/schemas/invitation'
import { handleTripActionError, refreshTrip } from './shared'

export const inviteMember = async (
  formData: FormData,
): Promise<ActionResult<{ token: string; email: string }>> => {
  const value = invitationSchema.parse(Object.fromEntries(formData))
  try {
    const { userId } = await requireTripRole(value.tripId, ['owner', 'editor'])
    const existing = await db.profile.findFirst({ where: { emailNormalized: value.email } })
    if (
      existing &&
      (await db.tripMembership.findUnique({
        where: { tripId_userId: { tripId: value.tripId, userId: existing.userId } },
      }))
    )
      return messageError('alreadyMember')
    const token = randomBytes(32).toString('hex')
    await db.$transaction(async (tx) => {
      await tx.tripInvitation.updateMany({
        where: { tripId: value.tripId, emailNormalized: value.email, status: 'pending' },
        data: { status: 'revoked' },
      })
      await tx.tripInvitation.create({
        data: {
          tripId: value.tripId,
          emailNormalized: value.email,
          role: value.role,
          tokenHash: createHash('sha256').update(token).digest('hex'),
          invitedBy: userId,
          expiresAt: new Date(Date.now() + 7 * 86_400_000),
        },
      })
    })
    refreshTrip()
    return { success: true, data: { token, email: value.email } }
  } catch (error) {
    return handleTripActionError(error)
  }
}

export const acceptInvitation = async (
  formData: FormData,
): Promise<ActionResult<{ tripId: string }>> => {
  const value = acceptInvitationSchema.parse(Object.fromEntries(formData))
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user?.email) throw new TripPermissionError()
    const hash = createHash('sha256').update(value.token).digest('hex')
    const invitation = await db.tripInvitation.findUnique({ where: { tokenHash: hash } })
    if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date())
      return messageError('invitationExpired')
    if (invitation.emailNormalized !== user.email.toLowerCase()) return messageError('wrongEmail')
    await db.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          displayName:
            (typeof user.user_metadata.full_name === 'string'
              ? user.user_metadata.full_name.trim().slice(0, 100)
              : '') || user.email!,
          emailNormalized: user.email!.toLowerCase(),
        },
        update: { emailNormalized: user.email!.toLowerCase() },
      })
      await tx.tripMembership.create({
        data: { tripId: invitation.tripId, userId: user.id, role: invitation.role },
      })
      await tx.tripInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted', acceptedBy: user.id, acceptedAt: new Date() },
      })
    })
    refreshTrip()
    return { success: true, data: { tripId: invitation.tripId } }
  } catch (error) {
    return handleTripActionError(error)
  }
}
