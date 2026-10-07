'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

type Props = {
  retry: () => void
}

const Error = ({ retry }: Props) => {
  const t = useTranslations('common.error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">{t('title')}</h2>
      <Button onClick={retry}>{t('actions.try_again')}</Button>
    </div>
  )
}

export default Error
