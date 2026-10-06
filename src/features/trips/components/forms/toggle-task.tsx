'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/utils/cn'
import { useRouter } from '@/i18n/navigation'
import { toggleTask } from '@/features/trips/actions/checklists'
import { actionError } from '@/features/trips/utils/action-error'

type Props = {
  tripId: string
  taskId: string
  isDone: boolean
  title: string
}
export const ToggleTask = ({ tripId, taskId, isDone, title }: Props): React.JSX.Element => {
  const router = useRouter()
  const t = useTranslations('trips')
  const errors = useTranslations('trips.errors.messages')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const accessibleLabel = t(
    isDone ? 'checklists.actions.tasks.markUndone' : 'checklists.actions.tasks.markDone',
    { title },
  )
  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label={accessibleLabel}
        aria-pressed={isDone}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const form = new FormData()
            form.set('tripId', tripId)
            form.set('taskId', taskId)
            form.set('isDone', String(!isDone))
            const result = await toggleTask(form)
            if (result.success) router.refresh()
            else setError(actionError(result, errors))
          })
        }}
        className={cn(
          'focus-visible:outline-focus size-5 shrink-0 rounded border focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60',
          isDone
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-line-strong bg-surface',
        )}
      >
        {isDone && <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} aria-hidden="true" />}
      </button>
      {error && (
        <span role="alert" className="text-error-text max-w-48 text-xs">
          {error}
        </span>
      )}
    </div>
  )
}
