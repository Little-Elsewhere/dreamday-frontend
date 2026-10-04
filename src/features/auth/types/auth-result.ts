import { AuthField } from '@/features/auth/constants/auth'
import type { ActionResult } from '@/types/action-result'

export type AuthResult = ActionResult<null, AuthField>
