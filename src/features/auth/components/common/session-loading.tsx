import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export const SessionLoading = async (): Promise<ReactElement> => {
  const t = await getTranslations('auth.common')

  return (
    <main
      className="bg-surface text-ink grid min-h-svh place-items-center antialiased"
      aria-busy="true"
    >
      <div className="flex items-center gap-3" role="status">
        <Skeleton className="bg-skeleton size-3 rounded-full motion-reduce:animate-none" />
        <span className="text-ink-soft text-sm">{t('messages.checkingSession')}</span>
      </div>
    </main>
  )
}
