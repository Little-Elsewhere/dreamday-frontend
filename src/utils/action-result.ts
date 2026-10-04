import { ActionErrorKind, type ActionFailure } from '@/types/action-result'

export const fieldError = <TField extends string>(
  field: TField,
  key: string,
): ActionFailure<TField> => ({
  success: false,
  error: { kind: ActionErrorKind.Field, field, key },
})

export const messageError = (key: string): ActionFailure<never> => ({
  success: false,
  error: { kind: ActionErrorKind.Message, key },
})

export const systemError = (): ActionFailure<never> => ({
  success: false,
  error: { kind: ActionErrorKind.System },
})
