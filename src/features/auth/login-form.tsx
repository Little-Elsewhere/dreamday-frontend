'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { useRef, useState, type ReactElement } from 'react'
import { Cancel01Icon, LockKeyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form/form-input'
import { ROUTES } from '@/constants/routes'
import { Link, useRouter } from '@/i18n/navigation'

import { requestPasswordResetAction, signInAction, type AuthError } from './actions'
import { AuthFeedback } from './components/auth-feedback'
import { PasswordToggle } from './components/password-toggle'
import {
  loginSchema,
  passwordResetSchema,
  type LoginFormValues,
  type PasswordResetFormValues,
} from './schemas/auth'

interface LoginFormProps {
  initialStatus?: 'confirmation-failed' | 'recovery-failed'
}

export function LoginForm({ initialStatus }: LoginFormProps): ReactElement {
  const t = useTranslations('auth')
  const router = useRouter()
  const resetDialog = useRef<HTMLDialogElement>(null)
  const errorSummary = useRef<HTMLDivElement>(null)
  const recoveryErrorSummary = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(
    initialStatus
      ? {
          text: t(
            initialStatus === 'recovery-failed'
              ? 'login.messages.recoveryFailed'
              : 'login.messages.confirmationFailed',
          ),
          isError: true,
        }
      : null,
  )
  const [recoveryError, setRecoveryError] = useState<string | null>(null)
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const resetForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '' },
  })
  const pending = loginForm.formState.isSubmitting || resetForm.formState.isSubmitting

  const errorMessages: Record<AuthError, string> = {
    invalidInput: t('common.errors.invalidInput'),
    signInFailed: t('common.errors.signInFailed'),
    signUpFailed: t('common.errors.signUpFailed'),
    resetFailed: t('common.errors.resetFailed'),
    updateFailed: t('common.errors.updateFailed'),
    sessionExpired: t('common.errors.sessionExpired'),
  }

  function showError(error: AuthError): void {
    setMessage({ text: errorMessages[error], isError: true })
    requestAnimationFrame(() => errorSummary.current?.focus())
  }

  async function handleLogin(values: LoginFormValues): Promise<void> {
    setMessage(null)

    const result = await signInAction(values)
    if (!result.success) return showError(result.error)

    router.replace('/')
    router.refresh()
  }

  async function handlePasswordReset(values: PasswordResetFormValues): Promise<void> {
    setMessage(null)

    const result = await requestPasswordResetAction(values)
    if (!result.success) {
      setRecoveryError(errorMessages[result.error])
      requestAnimationFrame(() => recoveryErrorSummary.current?.focus())
      return
    }

    resetDialog.current?.close()
    setRecoveryError(null)
    setMessage({ text: t('recovery.messages.resetEmailSent'), isError: false })
  }

  return (
    <>
      <p className="text-champagne-ink mb-3 text-[13px] font-semibold tracking-[0.16em] uppercase">
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

      {message && (
        <AuthFeedback
          message={message.text}
          isError={message.isError}
          focusRef={message.isError ? errorSummary : undefined}
        />
      )}

      <FormProvider {...loginForm}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void loginForm.handleSubmit(handleLogin)(event)
          }}
        >
          <FormInput
            name="email"
            id="login-email"
            label={t('login.labels.email')}
            labelClassName="text-ink"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('login.placeholders.email')}
            required
            maxLength={254}
            errorMessage={t('common.errors.emailInvalid')}
          />
          <FormInput
            name="password"
            id="login-password"
            label={t('login.labels.password')}
            labelClassName="text-ink"
            className="pr-14"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.placeholders.password')}
            required
            maxLength={72}
            errorMessage={t('common.errors.passwordRequired')}
            endAdornment={
              <PasswordToggle
                shown={showPassword}
                onToggle={() => setShowPassword((shown) => !shown)}
                showLabel={t('common.actions.showPassword')}
                hideLabel={t('common.actions.hidePassword')}
              />
            }
          />
          <div className="flex items-center justify-between gap-4 text-sm max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-1">
            <span className="text-ink-soft [&_svg]:text-champagne inline-flex items-center gap-2 [&_svg]:shrink-0">
              <HugeiconsIcon icon={LockKeyIcon} size={17} strokeWidth={1.7} aria-hidden="true" />
              {t('login.labels.secureSignIn')}
            </span>
            <Button
              variant="link"
              className="px-0 decoration-transparent hover:decoration-current"
              type="button"
              disabled={pending}
              onClick={() => {
                setMessage(null)
                setRecoveryError(null)
                resetForm.reset({ email: loginForm.getValues('email') })
                resetDialog.current?.showModal()
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
          className="text-primary focus-visible:outline-focus min-h-9 cursor-pointer rounded-md bg-transparent p-0 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.REGISTER}
        >
          {t('login.actions.register')}
        </Link>
      </p>

      <p className="text-ink-soft [&_svg]:text-champagne mt-8 flex items-start gap-3 text-[13px] leading-[1.55] [&_svg]:mt-px [&_svg]:shrink-0">
        <HugeiconsIcon icon={LockKeyIcon} size={18} strokeWidth={1.7} aria-hidden="true" />
        <span>{t('login.content.securityNote')}</span>
      </p>

      <dialog
        className="border-line bg-surface text-ink backdrop:bg-overlay m-auto w-[min(calc(100%-2rem),460px)] max-w-none rounded-xl border p-0 shadow-2xl"
        ref={resetDialog}
        aria-labelledby="reset-title"
        aria-describedby="reset-description"
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
              onClick={() => resetDialog.current?.close()}
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
          <FormProvider {...resetForm}>
            <form
              className="mt-10 grid gap-5"
              noValidate
              onSubmit={(event) => {
                void resetForm.handleSubmit(handlePasswordReset)(event)
              }}
            >
              {recoveryError && (
                <AuthFeedback message={recoveryError} isError focusRef={recoveryErrorSummary} />
              )}
              <FormInput
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
                errorMessage={t('common.errors.emailInvalid')}
              />
              <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
                <Button
                  variant="outline"
                  type="button"
                  disabled={pending}
                  onClick={() => resetDialog.current?.close()}
                >
                  {t('recovery.actions.cancel')}
                </Button>
                <Button
                  className="w-full md:w-auto md:min-w-47"
                  type="submit"
                  loading={resetForm.formState.isSubmitting}
                  loadingLabel={t('recovery.actions.submitting')}
                >
                  {t('recovery.actions.submit')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </dialog>
    </>
  )
}
