import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/utils/cn'

const TripCreateSkeleton = (): ReactElement => (
  <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6 md:pt-8 lg:px-8 2xl:pt-10">
    <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="grid min-w-0 gap-2">
        <Skeleton className="h-3.5 w-32 motion-reduce:animate-none" />
        <Skeleton className="h-8 w-64 max-w-full motion-reduce:animate-none sm:h-9" />
        <Skeleton className="h-6 w-full max-w-2xl motion-reduce:animate-none" />
      </div>
      <Skeleton className="rounded-auth h-11 w-24 motion-reduce:animate-none" />
    </div>

    <div
      className="border-line mb-6 flex items-center gap-2 border-b pb-5 sm:gap-6"
      aria-hidden="true"
    >
      {[1, 2].map((step) => (
        <div className="contents" key={step}>
          <div
            className={cn(
              'rounded-auth flex min-h-16 min-w-0 flex-1 items-center gap-2 border border-transparent px-2 py-2 sm:gap-3 sm:px-4 sm:py-3',
              step === 1 && 'border-line bg-muted',
            )}
          >
            {step === 1 ? (
              <span className="bg-primary grid size-8 shrink-0 place-items-center rounded-full sm:size-10">
                <Skeleton className="h-3 w-3 rounded-full motion-reduce:animate-none" />
              </span>
            ) : (
              <span className="border-line-strong bg-surface grid size-8 shrink-0 place-items-center rounded-full border sm:size-10">
                <Skeleton className="h-3 w-3 rounded-full motion-reduce:animate-none" />
              </span>
            )}
            <div className="grid min-w-0 gap-2">
              <Skeleton className="h-4 w-32 max-w-full motion-reduce:animate-none sm:h-5" />
              <Skeleton className="hidden h-3 w-24 motion-reduce:animate-none min-[640px]:block" />
            </div>
          </div>
          {step === 1 && (
            <span aria-hidden="true" className="bg-line h-px min-w-3 flex-1 max-sm:hidden" />
          )}
        </div>
      ))}
    </div>

    <div className="grid gap-6" aria-hidden="true">
      <section className="grid gap-4">
        <article className="border-line bg-surface grid overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="bg-paper min-w-0">
            <Skeleton className="aspect-4/3 min-h-56 rounded-none motion-reduce:animate-none md:min-h-64" />
            <div className="border-line bg-paper grid justify-items-center gap-2 border-t px-4 py-4">
              <Skeleton className="rounded-auth h-11 w-32 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-56 max-w-full motion-reduce:animate-none" />
            </div>
          </div>

          <div className="grid content-center gap-5 p-5 md:p-6 lg:p-8">
            <div className="grid gap-2">
              <Skeleton className="h-3.5 w-48 motion-reduce:animate-none" />
              <Skeleton className="h-12 motion-reduce:animate-none" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-28 motion-reduce:animate-none" />
              <Skeleton className="h-12 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-8 justify-self-end motion-reduce:animate-none" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
              <Skeleton className="h-20 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-8 justify-self-end motion-reduce:animate-none" />
            </div>
            <Skeleton className="h-6 w-36 rounded-full motion-reduce:animate-none" />
          </div>
        </article>

        <div className="border-line bg-surface grid overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,1.1fr)]">
          <section className="grid content-start gap-3 p-5 md:p-6">
            <Skeleton className="h-4 w-36 motion-reduce:animate-none" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((dateField) => (
                <div className="grid min-w-0 gap-2" key={dateField}>
                  <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
                  <Skeleton className="h-12 motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          </section>
          <section className="border-line grid content-center gap-2 border-t px-5 py-4 sm:px-6 md:border-t-0 md:border-l">
            <Skeleton className="h-3 w-24 motion-reduce:animate-none" />
            <Skeleton className="h-6 w-24 motion-reduce:animate-none" />
            <Skeleton className="h-3 w-48 max-w-full motion-reduce:animate-none" />
          </section>
          <section className="border-line grid content-start gap-3 border-t p-5 sm:p-6 md:border-t-0 md:border-l">
            <Skeleton className="h-4 w-36 motion-reduce:animate-none" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="rounded-auth h-11 w-24 motion-reduce:animate-none" />
              <Skeleton className="rounded-auth h-11 w-28 motion-reduce:animate-none" />
              <Skeleton className="rounded-auth h-11 w-32 motion-reduce:animate-none" />
            </div>
          </section>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <Skeleton className="rounded-auth h-11 w-16 motion-reduce:animate-none" />
        <Skeleton className="rounded-auth h-11 w-48 motion-reduce:animate-none" />
      </div>
    </div>
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
              <Skeleton className="bg-skeleton h-4 w-36 motion-reduce:animate-none" />
              <div className="hidden gap-2 sm:grid">
                <Skeleton className="bg-skeleton h-4 w-28 justify-self-end motion-reduce:animate-none" />
                <Skeleton className="bg-skeleton h-3 w-20 justify-self-end motion-reduce:animate-none" />
              </div>
              <Skeleton className="bg-skeleton rounded-auth h-11 w-10 motion-reduce:animate-none sm:w-32" />
            </div>
          </div>
        </header>
        <TripCreateSkeleton />
      </div>
    </main>
  )
}

export default Loading
