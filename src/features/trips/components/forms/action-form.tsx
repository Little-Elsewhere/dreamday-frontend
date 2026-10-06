'use client'

import { useTranslations } from 'next-intl'
import { FormProvider, type DefaultValues, type FieldValues } from 'react-hook-form'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { actionError } from '@/features/trips/utils/action-error'
import { useRouter } from '@/i18n/navigation'
import type { ActionResult } from '@/types/action-result'
import { useTripActionForm } from '@/features/trips/hooks/use-trip-action-form'

type Props<TInput extends FieldValues, TOutput extends FieldValues, TData> = {
  action: (formData: FormData) => Promise<ActionResult<TData>>
  children: React.ReactNode
  className?: string
  defaultValues: DefaultValues<TInput>
  onSuccess?: (data: TData) => void
  resetOnSuccess?: boolean
  schema: z.ZodType<TOutput, TInput>
  submitLabel: string
}

export const ActionForm = <TInput extends FieldValues, TOutput extends FieldValues, TData>({
  action,
  children,
  className,
  defaultValues,
  onSuccess,
  resetOnSuccess = true,
  schema,
  submitLabel,
}: Props<TInput, TOutput, TData>): React.JSX.Element => {
  const router = useRouter()
  const errors = useTranslations('trips.errors.messages')
  const t = useTranslations('trips')
  const { form, result, pending, submit } = useTripActionForm({
    schema,
    action,
    defaultValues,
    onSuccess: (data, _values, currentForm) => {
      if (resetOnSuccess) currentForm.reset(defaultValues)
      router.refresh()
      onSuccess?.(data)
    },
  })
  const error = actionError(result, errors)

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={submit} className={className ?? 'flex flex-col gap-4'}>
        {children}
        {error && (
          <p role="alert" className="text-error-text text-sm">
            {error}
          </p>
        )}
        <Button type="submit" loading={pending} loadingLabel={t('common.actions.saving')}>
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  )
}
