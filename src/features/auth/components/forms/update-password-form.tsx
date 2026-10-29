'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { FeedbackMessage } from '@/components/common/feedback-message'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { updatePassword } from '@/features/auth/actions/auth'
import { type UpdatePasswordFormValues, updatePasswordSchema } from '@/features/auth/schemas/auth'
import { applyFormError } from '@/features/auth/utils/action-form'

export const UpdatePasswordForm = () => {
  const t = useTranslations('auth')
  const tRoot = useTranslations()
  const [formMessage, setFormMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  })

  const handleUpdatePassword = async (values: UpdatePasswordFormValues) => {
    setFormMessage('')
    setSuccessMessage('')
    const result = await updatePassword(values)
    if (result.success) {
      form.reset()
      setSuccessMessage(t('updatePassword.messages.success'))
      return
    }

    applyFormError(result, form.setError, setFormMessage, tRoot)
    queueMicrotask(() => feedbackRef.current?.focus())
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('updatePassword.content.eyebrow')}
      </p>
      <h1
        className="text-primary focus-visible:outline-focus m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em] focus-visible:outline-2 focus-visible:outline-offset-3"
        id="auth-title"
        tabIndex={-1}
      >
        {t('updatePassword.content.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]">{t('updatePassword.content.intro')}</p>

      {formMessage && <FeedbackMessage isError message={formMessage} focusRef={feedbackRef} />}
      {successMessage && <FeedbackMessage isError={false} message={successMessage} />}

      <FormProvider {...form}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit(handleUpdatePassword)(event)
          }}
        >
          <PasswordInput<UpdatePasswordFormValues>
            name="currentPassword"
            id="current-password"
            label={t('updatePassword.labels.currentPassword')}
            labelClassName="text-ink"
            autoComplete="current-password"
            placeholder={t('updatePassword.placeholders.currentPassword')}
            required
            maxLength={128}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <PasswordInput<UpdatePasswordFormValues>
            name="password"
            id="new-password"
            label={t('updatePassword.labels.password')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('updatePassword.placeholders.password')}
            required
            minLength={12}
            maxLength={128}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <PasswordInput<UpdatePasswordFormValues>
            name="confirmPassword"
            id="confirm-new-password"
            label={t('updatePassword.labels.confirmPassword')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('updatePassword.placeholders.confirmPassword')}
            required
            minLength={12}
            maxLength={128}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <Button
            className="w-full"
            type="submit"
            loading={form.formState.isSubmitting}
            loadingLabel={t('updatePassword.actions.submitting')}
          >
            {t('updatePassword.actions.submit')}
          </Button>
        </form>
      </FormProvider>
    </>
  )
}
