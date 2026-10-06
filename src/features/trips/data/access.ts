import 'server-only'

import type { TripRole } from '@prisma/client'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export class TripPermissionError extends Error {
  constructor() {
    super('forbidden')
  }
}

export const currentUserId = async (): Promise<string> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) throw new TripPermissionError()
  return data.claims.sub
}

export const requireTripRole = async (
  tripId: string,
  allowed: TripRole[],
): Promise<{ userId: string; membershipId: string; role: TripRole }> => {
  const userId = await currentUserId()
  const membership = await db.tripMembership.findUnique({
    where: { tripId_userId: { tripId, userId } },
  })
  if (!membership || !allowed.includes(membership.role)) throw new TripPermissionError()
  return { userId, membershipId: membership.id, role: membership.role }
}
