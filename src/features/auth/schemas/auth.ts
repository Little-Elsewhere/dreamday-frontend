import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'auth.common.errors.emailInvalid' }))
  .pipe(z.string().max(254, { error: 'auth.common.errors.emailTooLong' }))

const loginPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.passwordRequired' })
  .pipe(z.string().max(128, { error: 'auth.common.errors.passwordTooLong' }))

const newPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.passwordRequired' })
  .pipe(
    z
      .string()
      .min(12, { error: 'auth.common.errors.passwordTooShort' })
      .max(128, { error: 'auth.common.errors.passwordTooLong' }),
  )

const confirmPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.confirmPasswordRequired' })
  .pipe(z.string().max(128, { error: 'auth.common.errors.confirmPasswordTooLong' }))

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const registrationSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
    error: 'auth.common.errors.passwordMismatch',
  })

export const passwordResetSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
    error: 'auth.common.errors.passwordMismatch',
  })

export const updatePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    password: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
    error: 'auth.common.errors.passwordMismatch',
  })

export type LoginFormValues = z.input<typeof loginSchema>
export type RegistrationFormValues = z.input<typeof registrationSchema>
export type PasswordResetFormValues = z.input<typeof passwordResetSchema>
export type ResetPasswordFormValues = z.input<typeof resetPasswordSchema>
export type UpdatePasswordFormValues = z.input<typeof updatePasswordSchema>
