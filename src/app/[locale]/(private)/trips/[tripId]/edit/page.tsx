import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getTripDraftById } from '@/features/trips/actions/trips'
import { TripCreateForm } from '@/features/trips/components/trip-create-form'
import { TripHeader } from '@/features/trips/components/trip-header'

type Props = { params: Promise<{ tripId: string }> }

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const [{ tripId }, t] = await Promise.all([params, getTranslations('trips.create')])
  const draft = await getTripDraftById(tripId)
  return {
    title: draft ? t('editTitle', { name: draft.name || t('title') }) : t('title'),
    description: t('intro'),
  }
}

const TripEditPage = async ({ params }: Props) => {
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

export default TripEditPage
