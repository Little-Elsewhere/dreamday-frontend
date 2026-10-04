import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

import { ActionErrorKind, type ActionError } from '@/types/action-result'

interface FormActionErrorOptions<TValues extends FieldValues> {
  fields: readonly FieldPath<TValues>[]
  setError: UseFormSetError<TValues>
  onMessage: (key: string) => void
  onSystemError: () => void
}

export const handleFormActionError = <TValues extends FieldValues>(
  error: ActionError,
  { fields, setError, onMessage, onSystemError }: FormActionErrorOptions<TValues>,
): void => {
  switch (error.kind) {
    case ActionErrorKind.Field: {
      const field = fields.find((name) => name === error.field)
      if (!field) {
        onSystemError()
        return
      }
      setError(field, { type: 'server', message: error.key }, { shouldFocus: true })
      return
    }
    case ActionErrorKind.Message:
      onMessage(error.key)
      return
    case ActionErrorKind.System:
      onSystemError()
  }
}
