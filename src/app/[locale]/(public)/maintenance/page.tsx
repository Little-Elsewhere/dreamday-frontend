import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('common.maintenance')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    robots: {
      index: false,
      follow: false,
    },
  }
}

const MaintenancePage = async (): Promise<ReactElement> => {
  const t = await getTranslations('common.maintenance')

  return (
    <main className="bg-paper text-ink flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
      <section
        aria-labelledby="maintenance-title"
        className="border-line-strong bg-surface grid w-full max-w-5xl overflow-hidden border shadow-sm lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
      >
        <div className="bg-primary text-primary-foreground relative flex min-h-72 flex-col justify-between overflow-hidden p-8 sm:p-12">
          <p className="text-champagne-soft m-0 text-xs font-semibold tracking-[0.16em] uppercase">
            {t('content.eyebrow')}
          </p>

          <div
            aria-hidden="true"
            className="relative mt-10 flex aspect-square w-full max-w-72 items-center justify-center self-center"
          >
            <div className="border-primary-foreground/20 absolute inset-0 rounded-full border" />
            <div className="border-champagne-soft/50 absolute inset-8 rounded-full border" />
            <div className="border-champagne-soft/70 absolute inset-16 rounded-full border" />
            <span className="bg-champagne-soft absolute top-1/4 left-1/4 size-3 rounded-full" />
            <span className="bg-champagne-soft absolute right-1/4 bottom-1/4 size-3 rounded-full" />
            <span className="bg-champagne-soft/70 absolute h-px w-1/2 -rotate-45" />
          </div>

          <p className="text-primary-foreground/70 mt-8 mb-0 max-w-[24ch] text-sm leading-6">
            {t('content.note')}
          </p>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p
            className="border-line bg-paper text-ink-soft mb-8 inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs font-medium"
            role="status"
          >
            <span
              aria-hidden="true"
              className="bg-champagne-ink size-2 rounded-full motion-safe:animate-pulse motion-reduce:animate-none"
            />
            {t('content.status')}
          </p>

          <h1
            className="text-primary m-0 max-w-[15ch] text-[clamp(2rem,6vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
            id="maintenance-title"
          >
            {t('content.title')}
          </h1>
          <p className="text-ink-soft mt-5 mb-0 max-w-[44ch] leading-7">
            {t('content.description')}
          </p>
        </div>
      </section>
    </main>
  )
}

export default MaintenancePage
