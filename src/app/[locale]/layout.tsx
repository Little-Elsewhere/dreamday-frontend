import { routing } from '@/i18n/routing'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { ReactNode } from 'react'
import { SerwistProvider } from '@/app/serwist'
import { cn } from '@/utils/cn'
import '@/app/globals.css'
import { serverEnv } from '@/env/server'

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
})

const appName = serverEnv.NEXT_PUBLIC_APP_NAME
const appDefaultTitle = serverEnv.NEXT_PUBLIC_APP_DEFAULT_TITLE
const appTitleTemplate = serverEnv.NEXT_PUBLIC_APP_TITLE_TEMPLATE
const appDescription = serverEnv.NEXT_PUBLIC_APP_DESCRIPTION

export const metadata: Metadata = {
  applicationName: appName,
  manifest: '/manifest.webmanifest',
  title: {
    default: appDefaultTitle,
    template: appTitleTemplate,
  },
  description: appDescription,
  appleWebApp: {
    capable: true,
    title: appDefaultTitle,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: appName,
    title: {
      default: appDefaultTitle,
      template: appTitleTemplate,
    },
    description: appDescription,
  },
  twitter: {
    card: 'summary',
    title: {
      default: appDefaultTitle,
      template: appTitleTemplate,
    },
    description: appDescription,
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const generateStaticParams = async () => {
  return routing.locales.map((locale) => ({ locale }))
}

const LocaleLayout = async ({ children, params }: Props) => {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale} className={cn('font-be-vietnam-pro', beVietnamPro.variable)}>
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
        </SerwistProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
