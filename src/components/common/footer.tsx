import 'server-only'

import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

export const Footer = async (): Promise<ReactElement> => {
  'use cache'
  cacheLife('days')

  const t = await getTranslations('common.footer')
  const year = new Date().getFullYear()

  return <footer className="text-ink-soft text-sm">{t('title', { year })}</footer>
}
