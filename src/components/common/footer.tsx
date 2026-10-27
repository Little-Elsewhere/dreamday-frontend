import 'server-only'

import { cacheLife } from 'next/cache'
import { getTranslations } from 'next-intl/server'

export const Footer = async () => {
  'use cache'
  cacheLife('days')

  const t = await getTranslations('common.footer')
  const year = new Date().getFullYear()

  return <footer className="text-ink-soft text-sm">{t('title', { year })}</footer>
}
