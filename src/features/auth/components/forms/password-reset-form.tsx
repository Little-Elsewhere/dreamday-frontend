'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { requestPasswordResetAction } from '@/features/auth/actions'
import { AuthFeedback } from '@/features/auth/components/common/auth-feedback'
import { passwordResetSchema, type PasswordResetFormValues } from '@/features/auth/schemas/auth'

interface PasswordResetFormProps {
  isOpen: boolean
  initialEmail: string
  onOpenChange: (isOpen: boolean) => void
  onResetSent: () => void
}

export const PasswordResetForm = ({
  isOpen,
  initialEmail,
  onOpenChange,
  onResetSent,
}: PasswordResetFormProps): ReactElement => {
  const t = useTranslations('auth')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [recoveryError, setRecoveryError] = useState<string | null>(null)
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '' },
  })
  const { reset, formState, handleSubmit } = form
  const pending = formState.isSubmitting

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      reset({ email: initialEmail })
      if (!dialog.open) dialog.showModal()
      return
    }

    if (dialog.open) dialog.close()
  }, [initialEmail, isOpen, reset])

  const handlePasswordReset = async (values: PasswordResetFormValues): Promise<void> => {
    setRecoveryError(null)

    const result = await requestPasswordResetAction(values)
    if (!result.success) {
      setRecoveryError(
        result.error === 'invalidInput'
          ? t('common.errors.invalidInput')
          : t('common.errors.resetFailed'),
      )
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    onOpenChange(false)
    onResetSent()
  }

  const closeDialog = (): void => {
    setRecoveryError(null)
    onOpenChange(false)
  }

  return (
    <dialog
      className="border-line bg-surface text-ink backdrop:bg-overlay m-auto w-[min(calc(100%-2rem),460px)] max-w-none rounded-xl border p-0 shadow-2xl"
      ref={dialogRef}
      aria-labelledby="reset-title"
      aria-describedby="reset-description"
      onCancel={() => onOpenChange(false)}
      onClose={closeDialog}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2
            className="text-primary m-0 text-2xl leading-[1.3] font-medium tracking-[-0.035em]"
            id="reset-title"
          >
            {t('recovery.content.title')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-ink-soft -mt-2.5 -mr-2.5 shrink-0 rounded-full"
            type="button"
            disabled={pending}
            aria-label={t('recovery.actions.close')}
            onClick={closeDialog}
          >
            <HugeiconsIcon
              className="size-5"
              icon={Cancel01Icon}
              size={20}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </Button>
        </div>
        <p className="text-ink-soft my-0 mt-3 mb-6" id="reset-description">
          {t('recovery.content.intro')}
        </p>
        <FormProvider {...form}>
          <form
            className="mt-10 grid gap-5"
            noValidate
            onSubmit={(event) => {
              void handleSubmit(handlePasswordReset)(event)
            }}
          >
            {recoveryError && (
              <AuthFeedback message={recoveryError} isError focusRef={errorSummaryRef} />
            )}
            <Input
              name="email"
              id="reset-email"
              label={t('recovery.labels.email')}
              labelClassName="text-ink"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t('recovery.placeholders.email')}
              required
              maxLength={254}
            />
            <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
              <Button variant="outline" type="button" disabled={pending} onClick={closeDialog}>
                {t('recovery.actions.cancel')}
              </Button>
              <Button
                className="w-full md:w-auto md:min-w-47"
                type="submit"
                loading={pending}
                loadingLabel={t('recovery.actions.submitting')}
              >
                {t('recovery.actions.submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </dialog>
  )
}
