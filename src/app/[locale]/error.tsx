'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">{t('title')}</h2>
      <Button onClick={reset}>{t('actions.try_again')}</Button>
    </div>
  )
}
