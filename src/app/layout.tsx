import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SerwistProvider } from './serwist'
import { Be_Vietnam_Pro } from 'next/font/google'
import { env } from '@/env/server'
import { cn } from '@/utils/cn'

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
})

const appName = env.NEXT_PUBLIC_APP_NAME
const appDefaultTitle = env.NEXT_PUBLIC_APP_DEFAULT_TITLE
const appTitleTemplate = env.NEXT_PUBLIC_APP_TITLE_TEMPLATE
const appDescription = env.NEXT_PUBLIC_APP_DESCRIPTION

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn('font-be-vietnam-pro', beVietnamPro.variable)}>
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  )
}
