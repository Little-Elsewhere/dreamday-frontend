import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { AcceptForm } from '@/features/trips/components/forms/accept-form'
import { Link } from '@/i18n/navigation'

interface InvitationPageProps {
  params: Promise<{ token: string }>
}

const InvitationPage = async ({ params }: InvitationPageProps): Promise<ReactElement> => {
  const [{ token }, t] = await Promise.all([params, getTranslations('trips')])
  return (
    <main className="bg-paper flex min-h-svh items-center justify-center px-6">
      <section className="border-line bg-surface w-full max-w-lg rounded-xl border p-8 shadow-sm">
        <Link href="/trips" className="text-primary text-xl font-semibold tracking-tighter">
          {t('common.labels.brand')}
        </Link>
        <h1 className="text-primary mt-10 text-3xl font-medium">{t('invitation.content.title')}</h1>
        <p className="text-ink-soft mt-3 mb-8">{t('invitation.content.description')}</p>
        <AcceptForm token={token} />
      </section>
    </main>
  )
}

export default InvitationPage
