'use client'

import { useEffect, Suspense } from 'react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { DEFAULT_LOCALE, Locale } from '@/constants/locale'
import { beVietnamPro } from '@/fonts'
import { cn } from '@/utils/cn'
import { getPathnameLocale } from '@/utils/locale'
import englishError from '../../messages/en/common/error.json'
import vietnameseError from '../../messages/vi/common/error.json'
import '@/app/globals.css'

const errorMessages = {
  en: englishError,
  vi: vietnameseError,
}

type Props = {
  retry: () => void
}

type ErrorContentProps = Props & {
  locale: Locale
}

const ErrorContent = ({ locale, retry }: ErrorContentProps) => {
  const t = errorMessages[locale]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-ink mb-4 text-2xl font-bold">{t.title}</h1>
      <Button onClick={retry}>{t.actions.try_again}</Button>
    </main>
  )
}

const LocalizedErrorContent = ({ retry }: Props) => {
  const locale = getPathnameLocale(usePathname() ?? '/') ?? DEFAULT_LOCALE

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <ErrorContent locale={locale} retry={retry} />
}

const GlobalError = ({ retry }: Props) => {
  return (
    <html lang={DEFAULT_LOCALE} className={cn('font-be-vietnam-pro', beVietnamPro.variable)}>
      <body>
        <Suspense fallback={<ErrorContent locale={DEFAULT_LOCALE} retry={retry} />}>
          <LocalizedErrorContent retry={retry} />
        </Suspense>
      </body>
    </html>
  )
}

export default GlobalError
