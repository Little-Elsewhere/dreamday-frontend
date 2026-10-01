import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'auth.common.errors.emailInvalid' }))
  .pipe(z.string().max(254, { error: 'auth.common.errors.emailTooLong' }))

const loginPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.passwordRequired' })
  .pipe(z.string().max(72, { error: 'auth.common.errors.passwordTooLong' }))

const newPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.passwordRequired' })
  .pipe(
    z
      .string()
      .min(8, { error: 'auth.common.errors.passwordTooShort' })
      .max(72, { error: 'auth.common.errors.passwordTooLong' }),
  )

const confirmPasswordSchema = z
  .string()
  .min(1, { error: 'auth.common.errors.confirmPasswordRequired' })
  .pipe(z.string().max(72, { error: 'auth.common.errors.confirmPasswordTooLong' }))

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .pipe(
        z
          .string()
          .min(2, { error: 'auth.register.errors.nameTooShort' })
          .max(80, { error: 'auth.register.errors.nameTooLong' }),
      ),
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

export const updatePasswordSchema = z
  .object({
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
export type UpdatePasswordFormValues = z.input<typeof updatePasswordSchema>
