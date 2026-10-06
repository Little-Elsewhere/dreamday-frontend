'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition, type BaseSyntheticEvent } from 'react'
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

import type { ActionResult } from '@/types/action-result'

type TripAction<TData> = (formData: FormData) => Promise<ActionResult<TData>>

interface UseTripActionFormOptions<TInput extends FieldValues, TOutput extends FieldValues, TData> {
  schema: z.ZodType<TOutput, TInput>
  action: TripAction<TData>
  defaultValues: DefaultValues<TInput>
  onSuccess?: (
    data: TData,
    values: TOutput,
    form: UseFormReturn<TInput, undefined, TOutput>,
  ) => void
}

interface UseTripActionFormReturn<TInput extends FieldValues, TOutput extends FieldValues, TData> {
  form: UseFormReturn<TInput, undefined, TOutput>
  result: ActionResult<TData> | null
  pending: boolean
  submit: (event?: BaseSyntheticEvent) => Promise<void>
}

export const useTripActionForm = <TInput extends FieldValues, TOutput extends FieldValues, TData>({
  schema,
  action,
  defaultValues,
  onSuccess,
}: UseTripActionFormOptions<TInput, TOutput, TData>): UseTripActionFormReturn<
  TInput,
  TOutput,
  TData
> => {
  const form = useForm<TInput, undefined, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  const [result, setResult] = useState<ActionResult<TData> | null>(null)
  const [isPending, startTransition] = useTransition()

  const submit = form.handleSubmit((values) => {
    const formData = new FormData()
    for (const [name, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        for (const item of value) formData.append(name, String(item))
      } else if (value !== undefined && value !== null) {
        formData.set(name, String(value))
      }
    }

    setResult(null)
    startTransition(async () => {
      const nextResult = await action(formData)
      setResult(nextResult)
      if (nextResult.success) onSuccess?.(nextResult.data, values, form)
    })
  })

  return { form, result, pending: isPending, submit }
}
