'use client'

import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { FeedbackMessage } from '@/components/common/feedback-message'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { resendVerification } from '@/features/auth/actions/auth'
import { Link } from '@/i18n/navigation'
import { ActionErrorKind } from '@/types/action-result'

type Props = {
  eyebrow: string
  title: string
  description: string
  helper: string
  actionLabel: string
  email?: string
  showResend?: boolean
}

export const AuthEmailSuccess = ({
  eyebrow,
  title,
  description,
  helper,
  actionLabel,
  email,
  showResend = false,
}: Props) => {
  const t = useTranslations()
  const [pending, setPending] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const feedbackRef = useRef<HTMLDivElement>(null)

  const handleResend = async () => {
    if (!email) return

    setPending(true)
    setStatusMessage('')
    setIsError(false)

    const result = await resendVerification(email)
    setPending(false)

    if (result.success) {
      setStatusMessage(t('auth.common.messages.resent'))
      return
    }

    setIsError(true)
    if (result.error.kind === ActionErrorKind.Message) {
      setStatusMessage(t(result.error.key))
    } else {
      setStatusMessage(t('auth.common.errors.system'))
    }
    queueMicrotask(() => feedbackRef.current?.focus())
  }

  return (
    <section aria-labelledby="auth-title">
      <div
        className="border-champagne bg-champagne-soft text-primary mb-8 grid size-14 place-items-center rounded-full border"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={Mail01Icon} size={26} strokeWidth={1.6} />
      </div>
      <p className="text-champagne-ink mb-3 text-sm font-semibold tracking-[0.16em] uppercase">
        {eyebrow}
      </p>
      <h1
        className="text-primary m-0 max-w-[14ch] text-[clamp(2rem,8vw,3.5rem)] leading-[1.12] font-medium tracking-[-0.055em]"
        id="auth-title"
      >
        {title}
      </h1>
      <p className="text-ink-soft mt-4 max-w-[42ch]" role="status">
        {description}
      </p>
      <p className="text-ink-soft mt-3 max-w-[42ch] text-sm">{helper}</p>

      {statusMessage && (
        <FeedbackMessage isError={isError} message={statusMessage} focusRef={feedbackRef} />
      )}

      <div className="mt-8 grid gap-3">
        {showResend && email && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={pending}
            loadingLabel={t('auth.common.actions.resending')}
            onClick={() => void handleResend()}
          >
            {t('auth.common.actions.resend')}
          </Button>
        )}
        <Link
          prefetch
          className="focus-visible:outline-focus rounded-auth border-primary bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 w-full items-center justify-center border px-4 py-2 text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          href={ROUTES.PUBLIC.AUTH.LOGIN}
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  )
}
