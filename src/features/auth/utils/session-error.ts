import type { AuthError } from '@supabase/supabase-js'
import {
  MISSING_SESSION_ERROR_CODES,
  MISSING_SESSION_ERROR_NAMES,
} from '@/features/auth/constants/session-error'

export const isMissingSession = (error: AuthError): boolean =>
  MISSING_SESSION_ERROR_NAMES.has(error.name) || MISSING_SESSION_ERROR_CODES.has(error.code ?? '')
