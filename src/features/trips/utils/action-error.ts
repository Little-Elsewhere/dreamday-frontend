import { useTranslations } from 'next-intl'

import type { ActionResult } from '@/types/action-result'

export const actionError = (
  result: ActionResult<unknown> | null,
  errors: ReturnType<typeof useTranslations<'trips.errors.messages'>>,
): string | null => {
  if (!result || result.success) return null
  if (result.error.kind !== 'message') return errors('system')
  const messages: Record<string, string> = {
    forbidden: errors('forbidden'),
    timeGap: errors('timeGap'),
    timeFold: errors('timeFold'),
    invalidAmount: errors('invalidAmount'),
    currencyLocked: errors('currencyLocked'),
    outsideTrip: errors('outsideTrip'),
    endBeforeStart: errors('endBeforeStart'),
    notFound: errors('notFound'),
    alreadyMember: errors('alreadyMember'),
    invitationExpired: errors('invitationExpired'),
    wrongEmail: errors('wrongEmail'),
  }
  return messages[result.error.key] ?? errors('system')
}
