import 'server-only'

import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

export const Footer = async (): Promise<ReactElement> => {
  'use cache'

  const t = await getTranslations('common.footer')

  return (
    <footer className="text-ink-soft text-sm">
      {t('title', { year: new Date().getFullYear() })}
    </footer>
  )
}
