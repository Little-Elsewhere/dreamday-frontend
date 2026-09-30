'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { useRef, useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants/routes'
import { Link, useRouter } from '@/i18n/navigation'

import { signUp } from '@/features/auth/actions/auth'
import { AuthFeedback } from '@/features/auth/components/common/auth-feedback'
import { registrationSchema, type RegistrationFormValues } from '@/features/auth/schemas/auth'

export const RegisterForm = (): ReactElement => {
  const t = useTranslations('auth')
  const router = useRouter()
  const errorSummary = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const showError = (): void => {
    setMessage({ text: t('common.errors.signUpFailed'), isError: true })
    requestAnimationFrame(() => errorSummary.current?.focus())
  }

  const handleRegistration = async (values: RegistrationFormValues): Promise<void> => {
    setMessage(null)

    try {
      const data = await signUp(values)

      if (data.session) {
        router.replace(ROUTES.PRIVATE.ACCOUNT)
        return
      }

      setMessage({ text: t('register.messages.confirmEmail'), isError: false })
    } catch {
      showError()
    }
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-[13px] font-semibold tracking-[0.16em] uppercase">
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

      {message && (
        <AuthFeedback
          message={message.text}
          isError={message.isError}
          focusRef={message.isError ? errorSummary : undefined}
        />
      )}

      <FormProvider {...form}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit(handleRegistration)(event)
          }}
        >
          <Input
            name="name"
            id="register-name"
            label={t('register.labels.name')}
            labelClassName="text-ink"
            type="text"
            autoComplete="name"
            placeholder={t('register.placeholders.name')}
            required
            maxLength={80}
          />
          <Input
            name="email"
            id="register-email"
            label={t('register.labels.email')}
            labelClassName="text-ink"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('register.placeholders.email')}
            required
            maxLength={254}
          />
          <PasswordInput<RegistrationFormValues>
            name="password"
            id="register-password"
            label={t('register.labels.password')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('register.placeholders.password')}
            description={t('register.content.passwordHelp')}
            required
            minLength={8}
            maxLength={72}
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
            minLength={8}
            maxLength={72}
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
          className="text-primary focus-visible:outline-focus inline-flex min-h-9 cursor-pointer items-center rounded-md bg-transparent p-0 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {t('register.actions.login')}
        </Link>
      </p>
    </>
  )
}
