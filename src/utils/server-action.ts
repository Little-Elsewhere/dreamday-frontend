import 'server-only'

import { ActionErrorKind, type ActionResult } from '@/types/action-result'
import { systemError } from '@/utils/action-result'

/** Run work after boundary schemas have been parsed; keep redirects outside this callback. */
export const runValidatedAction = async <TData, TField extends string = string>(
  action: string,
  operation: () => Promise<ActionResult<TData, TField>>,
): Promise<ActionResult<TData, TField>> => {
  let result: ActionResult<TData, TField>

  try {
    result = await operation()
  } catch (error) {
    console.error('Unexpected exception during server action', {
      action,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    return systemError()
  }

  if (!result.success && result.error.kind === ActionErrorKind.System) {
    console.error('Server action returned a system error', { action })
  }

  return result
}
