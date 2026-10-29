'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { FeedbackMessage } from '@/components/common/feedback-message'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants/routes'
import { resetPassword } from '@/features/auth/actions/auth'
import { type ResetPasswordFormValues, resetPasswordSchema } from '@/features/auth/schemas/auth'
import { applyFormError } from '@/features/auth/utils/action-form'
import { Link } from '@/i18n/navigation'

type Props = {
  token: string
}

export const ResetPasswordForm = ({ token }: Props) => {
  const t = useTranslations('auth')
  const tRoot = useTranslations()
  const [formMessage, setFormMessage] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setFormMessage('')
    const result = await resetPassword(token, values)
    if (result.success) return

    applyFormError(result, form.setError, setFormMessage, tRoot)
    queueMicrotask(() => feedbackRef.current?.focus())
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('resetPassword.content.eyebrow')}
      </p>
      <h1
        className="text-primary focus-visible:outline-focus m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em] focus-visible:outline-2 focus-visible:outline-offset-3"
        id="auth-title"
        tabIndex={-1}
      >
        {t('resetPassword.content.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]">{t('resetPassword.content.intro')}</p>

      {formMessage && <FeedbackMessage isError message={formMessage} focusRef={feedbackRef} />}

      <FormProvider {...form}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit(handleResetPassword)(event)
          }}
        >
          <PasswordInput<ResetPasswordFormValues>
            name="password"
            id="reset-password"
            label={t('resetPassword.labels.password')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('resetPassword.placeholders.password')}
            required
            minLength={12}
            maxLength={128}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <PasswordInput<ResetPasswordFormValues>
            name="confirmPassword"
            id="reset-confirm-password"
            label={t('resetPassword.labels.confirmPassword')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('resetPassword.placeholders.confirmPassword')}
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
            loadingLabel={t('resetPassword.actions.submitting')}
          >
            {t('resetPassword.actions.submit')}
          </Button>
        </form>
      </FormProvider>

      <p className="text-ink-soft mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <Link
          prefetch
          className="text-primary focus-visible:outline-focus inline-flex min-h-9 cursor-pointer items-center rounded-md bg-transparent p-0 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {t('resetPassword.actions.login')}
        </Link>
      </p>
    </>
  )
}
