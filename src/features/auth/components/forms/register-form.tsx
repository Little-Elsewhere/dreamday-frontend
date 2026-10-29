'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { FeedbackMessage } from '@/components/common/feedback-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants/routes'
import { register } from '@/features/auth/actions/auth'
import { type RegistrationFormValues, registrationSchema } from '@/features/auth/schemas/auth'
import { applyFormError } from '@/features/auth/utils/action-form'
import { Link } from '@/i18n/navigation'

export const RegisterForm = () => {
  const t = useTranslations('auth')
  const tRoot = useTranslations()
  const [formMessage, setFormMessage] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const handleRegistration = async (values: RegistrationFormValues) => {
    setFormMessage('')
    const result = await register(values)
    if (result.success) return

    applyFormError(result, form.setError, setFormMessage, tRoot)
    queueMicrotask(() => feedbackRef.current?.focus())
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('register.content.eyebrow')}
      </p>
      <h1
        className="text-primary focus-visible:outline-focus m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em] focus-visible:outline-2 focus-visible:outline-offset-3"
        id="auth-title"
        tabIndex={-1}
      >
        {t('register.content.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]">{t('register.content.intro')}</p>

      {formMessage && <FeedbackMessage isError message={formMessage} focusRef={feedbackRef} />}

      <FormProvider {...form}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit(handleRegistration)(event)
          }}
        >
          <Input
            name="email"
            id="register-email"
            label={t('common.labels.email')}
            labelClassName="text-ink"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('common.placeholders.email')}
            required
            maxLength={254}
          />
          <PasswordInput<RegistrationFormValues>
            name="password"
            id="register-password"
            label={t('common.labels.password')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('register.placeholders.password')}
            description={t('register.content.passwordHelp')}
            required
            minLength={12}
            maxLength={128}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <PasswordInput<RegistrationFormValues>
            name="confirmPassword"
            id="confirm-password"
            label={t('register.labels.confirmPassword')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('register.placeholders.confirmPassword')}
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
            loadingLabel={t('register.actions.submitting')}
          >
            {t('register.actions.submit')}
          </Button>
        </form>
      </FormProvider>

      <p className="text-ink-soft mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span>{t('register.prompts.hasAccount')}</span>
        <Link
          prefetch
          className="text-primary focus-visible:outline-focus inline-flex min-h-9 cursor-pointer items-center rounded-md bg-transparent p-0 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {t('common.actions.login')}
        </Link>
      </p>
    </>
  )
}
