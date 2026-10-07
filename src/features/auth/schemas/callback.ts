import { z } from 'zod'
import type { EmailOtpType as SupabaseEmailOtpType } from '@supabase/supabase-js'

import { ROUTES } from '@/constants/routes'
import { LOCALES } from '@/constants/locale'
import { AuthEmailOtpType } from '@/features/auth/constants/auth'
import { removeLocalePrefix } from '@/utils/locale'

export const emailOtpTypeSchema = z
  .enum(AuthEmailOtpType)
  .transform((type): SupabaseEmailOtpType => type)

export const confirmationSchema = z.object({
  token_hash: z.string().min(1).max(512),
  type: emailOtpTypeSchema,
  next: z.string().max(2048).optional().catch(undefined),
})

type SupportedLocale = (typeof LOCALES)[number]

export const getConfirmationRedirect = (
  next: string | undefined,
  appUrl: string,
  fallbackLocale: SupportedLocale,
): { href: string; locale: SupportedLocale } => {
  const fallback = { href: ROUTES.PUBLIC.ROOT, locale: fallbackLocale }
  if (!next) return fallback

  try {
    // Supabase passes redirectTo as an absolute URL; only keep destinations on this app.
    const appOrigin = new URL(appUrl).origin
    const target = new URL(next, appOrigin)
    if (target.origin !== appOrigin) return fallback

    const localeSegment = target.pathname.split('/')[1]
    const locale = LOCALES.find((candidate) => candidate === localeSegment) ?? fallbackLocale
    const pathname = removeLocalePrefix(target.pathname)

    return { href: `${pathname}${target.search}${target.hash}`, locale }
  } catch {
    return fallback
  }
}
