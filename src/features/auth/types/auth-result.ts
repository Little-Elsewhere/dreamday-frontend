import { AuthField } from '@/features/auth/constants/auth'
import { type ActionError, ActionErrorKind, type ActionResult } from '@/types/action-result'

export type AuthResult = ActionResult<null, AuthField>

export type AuthActionResult =
  | { success: true; data: null }
  | {
      success: false
      error: Exclude<ActionError<AuthField>, { kind: ActionErrorKind.System }>
    }

export type AuthActionFailure = Extract<AuthActionResult, { success: false }>
