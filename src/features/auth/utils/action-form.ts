import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

import { ActionErrorKind, type ActionResult } from '@/types/action-result'

type Translate = (key: string) => string

export const applyFormError = <
  TFieldValues extends FieldValues,
  TField extends FieldPath<TFieldValues>,
>(
  result: Extract<ActionResult<unknown, TField>, { success: false }>,
  setError: UseFormSetError<TFieldValues>,
  setFormMessage: (message: string) => void,
  t: Translate,
) => {
  if (result.error.kind === ActionErrorKind.Field) {
    setError(result.error.field, { type: 'server', message: result.error.key })
    return
  }

  if (result.error.kind === ActionErrorKind.Message) {
    setFormMessage(t(result.error.key))
    return
  }

  setFormMessage(t('auth.common.errors.system'))
}
