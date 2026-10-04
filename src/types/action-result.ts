export enum ActionErrorKind {
  Field = 'field',
  Message = 'message',
  System = 'system',
}

export type ActionError<TField extends string = string> =
  | { kind: ActionErrorKind.Field; field: TField; key: string }
  | { kind: ActionErrorKind.Message; key: string }
  | { kind: ActionErrorKind.System }

export type ActionFailure<TField extends string = string> = {
  success: false
  error: ActionError<TField>
}

export type ActionResult<TData, TField extends string = string> =
  { success: true; data: TData } | ActionFailure<TField>
