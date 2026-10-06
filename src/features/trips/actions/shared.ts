import 'server-only'

import { revalidatePath } from 'next/cache'

import { TripPermissionError } from '@/features/trips/data/access'
import { InvalidLocalTimeError } from '@/features/trips/utils/time'
import { messageError, systemError } from '@/utils/action-result'

export const refreshTrip = (): void => {
  revalidatePath('/[locale]/trips', 'page')
  revalidatePath('/[locale]/trips/[tripId]', 'page')
}

export const handleTripActionError = (
  error: unknown,
): ReturnType<typeof systemError> | ReturnType<typeof messageError> => {
  if (error instanceof TripPermissionError) return messageError('forbidden')
  if (error instanceof InvalidLocalTimeError)
    return messageError(error.reason === 'gap' ? 'timeGap' : 'timeFold')
  if (error instanceof Error && error.message === 'invalidAmount')
    return messageError('invalidAmount')
  return systemError()
}
