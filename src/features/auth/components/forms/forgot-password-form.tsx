'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { FeedbackMessage } from '@/components/common/feedback-message'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { forgotPassword } from '@/features/auth/actions/auth'
import { type PasswordResetFormValues, passwordResetSchema } from '@/features/auth/schemas/auth'
import { applyFormError } from '@/features/auth/utils/action-form'

type Props = {
  initialEmail: string
  show: (isOpen: boolean) => void
}

export const ForgotPasswordForm = ({ initialEmail, show }: Props) => {
  const t = useTranslations('auth')
  const tRoot = useTranslations()
  const [formMessage, setFormMessage] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: initialEmail },
  })
  const { formState, handleSubmit, setError } = form
  const pending = formState.isSubmitting

  const handlePasswordReset = async (values: PasswordResetFormValues) => {
    setFormMessage('')
    const result = await forgotPassword(values)
    if (result.success) return

    applyFormError(result, setError, setFormMessage, tRoot)
    queueMicrotask(() => feedbackRef.current?.focus())
  }

  return (
    <Dialog open onOpenChange={show}>
      <DialogContent
        className="border-line bg-surface text-ink w-[min(calc(100%-2rem),460px)] max-w-none gap-0 rounded-xl border p-0 shadow-2xl ring-0 sm:max-w-none"
        overlayClassName="bg-overlay"
      >
        <div className="p-6 md:p-8">
          <DialogHeader className="flex-row items-start justify-between gap-4 text-left">
            <DialogTitle className="text-primary m-0 text-2xl leading-[1.3] font-medium tracking-[-0.035em]">
              {t('recovery.content.title')}
            </DialogTitle>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-ink-soft -mt-2.5 -mr-2.5 shrink-0 rounded-full"
                  type="button"
                  disabled={pending}
                  aria-label={t('recovery.actions.close')}
                />
              }
            >
              <HugeiconsIcon
                className="size-5"
                icon={Cancel01Icon}
                size={20}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </DialogClose>
          </DialogHeader>
          <DialogDescription className="text-ink-soft my-0 mt-3 mb-6">
            {t('recovery.content.intro')}
          </DialogDescription>
          {formMessage && <FeedbackMessage isError message={formMessage} focusRef={feedbackRef} />}
          <FormProvider {...form}>
            <form
              className="mt-10 grid gap-5"
              noValidate
              onSubmit={(event) => {
                void handleSubmit(handlePasswordReset)(event)
              }}
            >
              <Input
                name="email"
                id="reset-email"
                label={t('common.labels.email')}
                labelClassName="text-ink"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={t('common.placeholders.email')}
                required
                maxLength={254}
              />
              <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
                <DialogClose render={<Button variant="outline" type="button" disabled={pending} />}>
                  {t('recovery.actions.cancel')}
                </DialogClose>
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
      </DialogContent>
    </Dialog>
  )
}
