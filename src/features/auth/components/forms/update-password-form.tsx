'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { useRef, useState, type ReactElement } from 'react'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { ROUTES } from '@/constants/routes'

import { updatePasswordAction } from '@/features/auth/actions/auth'
import { AuthFeedback } from '@/features/auth/components/common/auth-feedback'
import { type UpdatePasswordFormValues, updatePasswordSchema } from '@/features/auth/schemas/auth'

export const UpdatePasswordForm = (): ReactElement => {
  const t = useTranslations('auth')
  const summary = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [updated, setUpdated] = useState(false)
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handleSubmit = async (values: UpdatePasswordFormValues): Promise<void> => {
    setMessage(null)

    try {
      await updatePasswordAction(values)
      form.reset()
      setUpdated(true)
    } catch {
      setMessage(t('updatePassword.errors.updateFailed'))
      requestAnimationFrame(() => summary.current?.focus())
    }
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
      {message && <AuthFeedback message={message} isError focusRef={summary} />}
      {updated ? (
        <div className="mt-6 grid gap-6">
          <AuthFeedback message={t('updatePassword.messages.success')} isError={false} />
          <Link
            className="bg-primary text-primary-foreground focus-visible:outline-focus rounded-auth inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            href={ROUTES.PUBLIC.ROOT}
          >
            {t('updatePassword.actions.continue')}
          </Link>
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            className="mt-10 grid gap-5"
            noValidate
            onSubmit={(event) => {
              void form.handleSubmit(handleSubmit)(event)
            }}
          >
            <PasswordInput<UpdatePasswordFormValues>
              name="password"
              id="new-password"
              label={t('updatePassword.labels.password')}
              labelClassName="text-ink"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              showLabel={t('common.actions.showPassword')}
              hideLabel={t('common.actions.hidePassword')}
            />
            <PasswordInput<UpdatePasswordFormValues>
              name="confirmPassword"
              id="confirm-new-password"
              label={t('updatePassword.labels.confirmPassword')}
              labelClassName="text-ink"
              autoComplete="new-password"
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
              loadingLabel={t('updatePassword.actions.submitting')}
            >
              {t('updatePassword.actions.submit')}
            </Button>
          </form>
        </FormProvider>
      )}
    </>
  )
}
