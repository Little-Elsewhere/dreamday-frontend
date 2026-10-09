import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

const TripDetailSkeleton = (): ReactElement => (
  <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
    <Skeleton className="h-5 w-28 motion-reduce:animate-none" />
    <article className="border-line bg-surface mt-5 overflow-hidden rounded-3xl border">
      <Skeleton className="bg-skeleton aspect-video max-h-128 min-h-56 rounded-none motion-reduce:animate-none" />
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)] lg:p-10">
        <section className="border-line grid content-start gap-4 rounded-2xl border p-5 sm:p-8">
          <Skeleton className="h-3.5 w-24 motion-reduce:animate-none" />
          <Skeleton className="h-7 w-48 max-w-full motion-reduce:animate-none" />
          <div className="mt-3 grid gap-4">
            {[0, 1, 2].map((day) => (
              <div className="border-line grid gap-3 border-l-2 py-2 pl-4 sm:pl-6" key={day}>
                <Skeleton className="h-5 w-36 motion-reduce:animate-none" />
                <Skeleton className="h-20 rounded-xl motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </section>
        <aside className="grid content-start gap-5">
          <section className="border-line grid gap-4 rounded-2xl border p-5 sm:p-6">
            <Skeleton className="h-3.5 w-24 motion-reduce:animate-none" />
            <Skeleton className="h-6 w-40 motion-reduce:animate-none" />
            {[0, 1, 2, 3, 4].map((fact) => (
              <div className="grid gap-2" key={fact}>
                <Skeleton className="h-3.5 w-20 motion-reduce:animate-none" />
                <Skeleton className="h-5 w-36 motion-reduce:animate-none" />
              </div>
            ))}
          </section>
          <Skeleton className="h-36 rounded-2xl motion-reduce:animate-none" />
        </aside>
      </div>
    </article>
  </div>
)

const Loading = async (): Promise<ReactElement> => {
  const t = await getTranslations('trips')

  return (
    <main className="bg-paper text-ink min-h-svh antialiased" aria-busy="true">
      <p className="sr-only" role="status">
        {t('loading')}
      </p>
      <div aria-hidden="true">
        <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
          <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Skeleton className="bg-skeleton size-9 rounded-full motion-reduce:animate-none" />
              <Skeleton className="bg-skeleton h-5 w-28 motion-reduce:animate-none" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden gap-2 sm:grid">
                <Skeleton className="bg-skeleton h-4 w-28 justify-self-end motion-reduce:animate-none" />
                <Skeleton className="bg-skeleton h-3 w-20 justify-self-end motion-reduce:animate-none" />
              </div>
              <Skeleton className="bg-skeleton rounded-auth h-11 w-10 motion-reduce:animate-none sm:w-32" />
            </div>
          </div>
        </header>
        <TripDetailSkeleton />
      </div>
    </main>
  )
}

export default Loading
