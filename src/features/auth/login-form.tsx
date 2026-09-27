'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { useRef, useState, type ReactElement } from 'react'
import { LockKeyIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { Link, useRouter } from '@/i18n/navigation'

import { signInAction, type AuthError } from './actions'
import { AuthFeedback } from './components/auth-feedback'
import { PasswordInput } from './components/password-input'
import { PasswordResetForm } from './password-reset-form'
import { loginSchema, type LoginFormValues } from './schemas/auth'

interface LoginFormProps {
  status?: string
}

export function LoginForm({ status }: LoginFormProps): ReactElement {
  const t = useTranslations('auth')
  const router = useRouter()
  const errorSummary = useRef<HTMLDivElement>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetInitialEmail, setResetInitialEmail] = useState('')
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(
    status
      ? {
          text: t(
            status === 'recovery-failed'
              ? 'login.messages.recoveryFailed'
              : 'login.messages.confirmationFailed',
          ),
          isError: true,
        }
      : null,
  )
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const pending = loginForm.formState.isSubmitting

  const errorMessages: Record<AuthError, string> = {
    invalidInput: t('common.errors.invalidInput'),
    signInFailed: t('common.errors.signInFailed'),
    signUpFailed: t('common.errors.signUpFailed'),
    resetFailed: t('common.errors.resetFailed'),
    updateFailed: t('common.errors.updateFailed'),
    signOutFailed: t('common.errors.signOutFailed'),
    sessionExpired: t('common.errors.sessionExpired'),
  }

  function showError(error: AuthError): void {
    setMessage({ text: errorMessages[error], isError: true })
    requestAnimationFrame(() => errorSummary.current?.focus())
  }

  async function handleLogin(values: LoginFormValues): Promise<void> {
    setMessage(null)

    try {
      const result = await signInAction(values)
      if (!result.success) return showError(result.error)

      router.replace(ROUTES.PRIVATE.ACCOUNT)
      router.refresh()
    } catch {
      showError('signInFailed')
    }
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
          <Input
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
          />
          <PasswordInput<LoginFormValues>
            name="password"
            id="login-password"
            label={t('login.labels.password')}
            labelClassName="text-ink"
            autoComplete="current-password"
            placeholder={t('login.placeholders.password')}
            required
            maxLength={72}
            showLabel={t('common.actions.showPassword')}
            hideLabel={t('common.actions.hidePassword')}
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
          {t('login.actions.register')}
        </Link>
      </p>

      <p className="text-ink-soft [&_svg]:text-champagne mt-8 flex items-start gap-3 text-[13px] leading-[1.55] [&_svg]:mt-px [&_svg]:shrink-0">
        <HugeiconsIcon icon={LockKeyIcon} size={18} strokeWidth={1.7} aria-hidden="true" />
        <span>{t('login.content.securityNote')}</span>
      </p>

      <PasswordResetForm
        isOpen={resetDialogOpen}
        initialEmail={resetInitialEmail}
        onOpenChange={setResetDialogOpen}
        onResetSent={() =>
          setMessage({ text: t('recovery.messages.resetEmailSent'), isError: false })
        }
      />
    </>
  )
}
