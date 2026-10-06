import 'server-only'

import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import { currentUserId } from './access'

export const listTrips = async () => {
  const userId = await currentUserId()
  return db.trip.findMany({
    where: { memberships: { some: { userId } } },
    include: { memberships: true, schedules: { orderBy: { startsAt: 'asc' }, take: 1 } },
    orderBy: { updatedAt: 'desc' },
  })
}

export const getTrip = async (tripId: string) => {
  const userId = await currentUserId()
  const membership = await db.tripMembership.findUnique({
    where: { tripId_userId: { tripId, userId } },
  })
  if (!membership) notFound()
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      memberships: { orderBy: { joinedAt: 'asc' } },
      invitations: { where: { status: 'pending' }, orderBy: { createdAt: 'desc' } },
      schedules: { orderBy: { startsAt: 'asc' } },
      checklists: {
        orderBy: { position: 'asc' },
        include: { tasks: { orderBy: { position: 'asc' } } },
      },
      fund: {
        include: { expenses: { orderBy: { incurredAt: 'desc' }, include: { splits: true } } },
      },
    },
  })
  if (!trip) notFound()
  const profiles = await db.profile.findMany({
    where: { userId: { in: trip.memberships.map((item) => item.userId) } },
  })
  return { trip, membership, profiles }
}
