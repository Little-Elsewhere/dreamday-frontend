import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { getTripDraftById } from '@/features/trips/actions/trips'
import { TripCreateForm } from '@/features/trips/components/trip-create-form'
import { TripCreateLoading } from '@/features/trips/components/trip-create-loading'
import { TripHeader } from '@/features/trips/components/trip-header'

type Props = { params: Promise<{ tripId: string }> }

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('trips.create')
  return { title: t('title'), description: t('intro') }
}

const TripEditContent = async ({ params }: Props) => {
  const { tripId } = await params
  const draft = await getTripDraftById(tripId)
  if (!draft) notFound()

  return (
    <main className="bg-paper text-ink min-h-svh antialiased">
      <TripHeader showTripsLink />
      <TripCreateForm initialDraft={draft} />
    </main>
  )
}

const TripEditPage = (props: Props) => (
  <Suspense fallback={<TripCreateLoading />}>
    <TripEditContent {...props} />
  </Suspense>
)

export default TripEditPage
