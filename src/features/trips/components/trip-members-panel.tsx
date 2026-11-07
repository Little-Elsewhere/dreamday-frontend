'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { addTripMember, listTripMembers, removeTripMember } from '@/features/trips/actions/trips'
import type { TripMember } from '@/features/trips/types/trip'
import { useRouter } from '@/i18n/navigation'

type Props = {
  tripId: string
  initialMembers: TripMember[]
}

export const TripMembersPanel = ({ tripId, initialMembers }: Props) => {
  const t = useTranslations('trips.detail')
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const refreshMembers = async () => {
    const next = await listTripMembers(tripId)
    setMembers(next)
  }

  const handleAdd = () => {
    setError('')
    startTransition(async () => {
      const result = await addTripMember(tripId, email.trim())
      if (!result.success) {
        setError(t('members.addFailed'))
        return
      }
      setEmail('')
      await refreshMembers()
      router.refresh()
    })
  }

  const handleRemove = (userId: string) => {
    setError('')
    startTransition(async () => {
      const result = await removeTripMember(tripId, userId)
      if (!result.success) {
        setError(t('members.removeFailed'))
        return
      }
      await refreshMembers()
      router.refresh()
    })
  }

  return (
    <section className="border-line bg-paper rounded-2xl border p-5 sm:p-6">
      <p className="text-champagne-ink text-xs font-semibold tracking-[0.16em] uppercase">
        {t('members.eyebrow')}
      </p>
      <h2 className="text-primary mt-2 text-xl font-medium">{t('members.title')}</h2>
      <p className="text-ink-soft mt-2 text-sm leading-relaxed">{t('members.description')}</p>
      <ul className="mt-4 grid gap-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="border-line bg-surface flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-primary text-sm font-medium">{member.email}</p>
              <p className="text-ink-soft text-xs">{t(`members.roles.${member.role}`)}</p>
            </div>
            {member.role !== 'owner' && (
              <Button
                disabled={pending}
                onClick={() => handleRemove(member.userId)}
                type="button"
                variant="ghost"
              >
                {t('members.remove')}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          aria-label={t('members.emailLabel')}
          className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth min-h-11 border px-3 text-sm outline-none focus-visible:ring-3"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('members.emailPlaceholder')}
          type="email"
          value={email}
        />
        <Button disabled={pending || !email.trim()} onClick={handleAdd} type="button">
          {pending ? t('members.adding') : t('members.add')}
        </Button>
      </div>
      {error && <p className="text-error-text mt-3 text-sm">{error}</p>}
    </section>
  )
}
