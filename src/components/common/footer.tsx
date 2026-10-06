import 'server-only'

import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'
import { cacheLife } from 'next/cache'

export const getCurrentYear = async () => {
  'use cache'
  cacheLife('max')
  return new Date().getFullYear()
}

export const Footer = async (): Promise<ReactElement> => {
  'use cache'

  const t = await getTranslations('common.footer')

  return (
    <footer className="text-ink-soft text-sm">
      {t('title', { year: await getCurrentYear() })}
    </footer>
  )
}
