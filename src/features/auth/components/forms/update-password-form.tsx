'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { type UpdatePasswordFormValues, updatePasswordSchema } from '@/features/auth/schemas/auth'

export const UpdatePasswordForm = () => {
  const t = useTranslations('auth')
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handleUpdatePassword = (): void => {}

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
      <FormProvider {...form}>
        <form
          className="mt-10 grid gap-5"
          noValidate
          onSubmit={(event) => {
            void form.handleSubmit(handleUpdatePassword)(event)
          }}
        >
          <PasswordInput<UpdatePasswordFormValues>
            name="password"
            id="new-password"
            label={t('updatePassword.labels.password')}
            labelClassName="text-ink"
            autoComplete="new-password"
            placeholder={t('updatePassword.placeholders.password')}
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
            placeholder={t('updatePassword.placeholders.confirmPassword')}
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
    </>
  )
}
