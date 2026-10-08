'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { useRef, useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { FeedbackMessage } from '@/components/common/feedback-message'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants/routes'
import { Link, useRouter } from '@/i18n/navigation'

import { signIn } from '@/features/auth/actions/auth'
import { AuthField } from '@/features/auth/constants/auth'
import { getAuthSystemErrorUrl } from '@/features/auth/utils/common'
import { ForgotPasswordForm } from './forgot-password-form'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth'
import { handleFormActionError } from '@/utils/form-action-error'

export const LoginForm = (): ReactElement => {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const systemErrorUrl = getAuthSystemErrorUrl(locale)
  const errorSummary = useRef<HTMLDivElement>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetInitialEmail, setResetInitialEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleLogin = async (values: LoginFormValues): Promise<void> => {
    setMessage(null)

    try {
      const result = await signIn(values)
      if (result.success) {
        router.replace(ROUTES.PRIVATE.TRIPS)
      } else {
        handleFormActionError(result.error, {
          fields: [AuthField.Email, AuthField.Password],
          setError: loginForm.setError,
          onMessage: (key) => {
            setMessage(t(key))
            requestAnimationFrame(() => errorSummary.current?.focus())
          },
          onSystemError: () => router.replace(systemErrorUrl),
        })
      }
    } catch {
      router.replace(systemErrorUrl)
    }
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {t('login.content.eyebrow')}
      </p>
      <h1
        className="text-primary focus-visible:outline-focus m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em] focus-visible:outline-2 focus-visible:outline-offset-3"
        id="auth-title"
        tabIndex={-1}
      >
        {t('login.content.title')}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]">{t('login.content.intro')}</p>

      {message && <FeedbackMessage message={message} isError focusRef={errorSummary} />}

      <FormProvider {...loginForm}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void loginForm.handleSubmit(handleLogin)(event)
          }}
        >
          <Input
            name="email"
            id="login-email"
            label={t('common.labels.email')}
            labelClassName="text-ink"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('common.placeholders.email')}
            required
            maxLength={254}
          />
          <PasswordInput<LoginFormValues>
            name="password"
            id="login-password"
            label={t('common.labels.password')}
            labelClassName="text-ink"
            autoComplete="current-password"
            placeholder={t('login.placeholders.password')}
            required
            maxLength={72}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
          />
          <div className="flex items-center justify-end gap-4 text-sm max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-1">
            <Button
              variant="link"
              className="px-0 decoration-transparent hover:decoration-current"
              type="button"
              disabled={loginForm.formState.isSubmitting}
              onClick={() => {
                setMessage(null)
                setResetInitialEmail(loginForm.getValues('email'))
                setResetDialogOpen(true)
              }}
            >
              {t('login.actions.forgotPassword')}
            </Button>
          </div>
          <Button
            className="w-full"
            type="submit"
            loading={loginForm.formState.isSubmitting}
            loadingLabel={t('login.actions.submitting')}
          >
            {t('login.actions.submit')}
          </Button>
        </form>
      </FormProvider>

      <p className="text-ink-soft mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span>{t('login.prompts.noAccount')}</span>
        <Link
          className="text-primary focus-visible:outline-focus inline-flex min-h-9 cursor-pointer items-center rounded-md bg-transparent p-0 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.REGISTER}
        >
          {t('common.actions.register')}
        </Link>
      </p>

      {resetDialogOpen && (
        <ForgotPasswordForm initialEmail={resetInitialEmail} show={setResetDialogOpen} />
      )}
    </>
  )
}
