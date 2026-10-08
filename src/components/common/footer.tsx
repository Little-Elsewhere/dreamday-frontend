import 'server-only'

import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'
import { cacheLife } from 'next/cache'

export const Footer = async (): Promise<ReactElement> => {
  'use cache'
  cacheLife('days')

  const t = await getTranslations('common.footer')
  const year = new Date().getFullYear()

  return <footer className="text-ink-soft text-sm">{t('title', { year })}</footer>
}
