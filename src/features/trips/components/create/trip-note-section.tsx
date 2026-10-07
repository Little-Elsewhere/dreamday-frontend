'use client'

import { useTranslations } from 'next-intl'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  note: string
  onChange: (note: string) => void
  onSave: () => Promise<void>
  pending: boolean
}

export const TripNoteSection = ({ note, onChange, onSave, pending }: Props): ReactElement => {
  const t = useTranslations('trips')

  return (
    <section className="border-line bg-surface rounded-2xl border p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-primary text-xl font-medium">{t('create.note.heading')}</h2>
          <p className="text-ink-soft mt-1 text-sm">{t('create.note.description')}</p>
        </div>
        <Button disabled={pending} onClick={() => void onSave()} type="button" variant="outline">
          {t('create.actions.saveNote')}
        </Button>
      </div>
      <label className="sr-only" htmlFor="trip-note">
        {t('create.note.label')}
      </label>
      <textarea
        id="trip-note"
        className="border-line-strong bg-field text-ink placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-primary/20 rounded-auth mt-5 min-h-36 w-full resize-y border px-3 py-3 text-base outline-none focus-visible:ring-3"
        maxLength={1000}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('create.note.placeholder')}
        value={note}
      />
      <p className="text-ink-soft mt-2 text-right text-xs">{note.length}/1000</p>
    </section>
  )
}
