import type { ReactElement, Ref } from 'react'

import { cn } from '@/utils/cn'

type Props = {
  message: string
  isError: boolean
  focusRef?: Ref<HTMLDivElement>
}

export const FeedbackMessage = ({ message, isError, focusRef }: Props): ReactElement => {
  return (
    <div
      className={cn(
        'rounded-auth mt-6 border px-4 py-3.5 text-sm',
        isError
          ? 'border-error-border bg-error-bg text-error-text'
          : 'border-success-border bg-success-bg text-success',
      )}
      role={isError ? 'alert' : 'status'}
      tabIndex={isError ? -1 : undefined}
      ref={focusRef}
    >
      {message}
    </div>
  )
}
