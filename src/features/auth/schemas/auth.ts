import { z } from 'zod'

const emailSchema = z.string().trim().pipe(z.email().max(254))

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
})

export const registrationSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: emailSchema,
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(1).max(72),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
  })

export const passwordResetSchema = z.object({
  email: emailSchema,
})

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(1).max(72),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.input<typeof loginSchema>
export type RegistrationFormValues = z.input<typeof registrationSchema>
export type PasswordResetFormValues = z.input<typeof passwordResetSchema>
export type UpdatePasswordFormValues = z.input<typeof updatePasswordSchema>
