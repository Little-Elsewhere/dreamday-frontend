import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

const OfflineLoading = async (): Promise<ReactElement> => {
  const t = await getTranslations('common.offline')

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
      aria-busy="true"
    >
      <p className="sr-only" role="status">
        {t('loading')}
      </p>
      <div className="grid w-full justify-items-center gap-4" aria-hidden="true">
        <Skeleton className="bg-skeleton rounded-auth h-9 w-56 max-w-full motion-reduce:animate-none" />
        <div className="grid w-full max-w-md justify-items-center gap-2">
          <Skeleton className="bg-skeleton rounded-auth h-5 w-full motion-reduce:animate-none" />
          <Skeleton className="bg-skeleton rounded-auth h-5 w-4/5 max-w-full motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  )
}

export default OfflineLoading
