'use client'

import { useState, type ReactElement } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { FeedbackMessage } from '@/components/common/feedback-message'
import { ROUTES } from '@/constants/routes'
import { useRouter } from '@/i18n/navigation'
import { signOut } from '@/features/auth/actions/auth'
import { generateLocalizedUrl } from '@/features/auth/utils/common'
import { ActionErrorKind } from '@/types/action-result'

export const SignOutButton = (): ReactElement => {
  const t = useTranslations('account')
  const locale = useLocale()
  const router = useRouter()
  const systemErrorUrl = generateLocalizedUrl(locale, ROUTES.PUBLIC.AUTH.ERROR, {
    queryParams: new URLSearchParams({ type: ActionErrorKind.System }),
  })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const handleSignOut = async (): Promise<void> => {
    setPending(true)
    setError(false)

    try {
      const result = await signOut()
      if (result.success) {
        router.replace(ROUTES.PUBLIC.AUTH.LOGIN)
      } else if (result.error.kind === ActionErrorKind.System) {
        router.replace(systemErrorUrl)
      } else {
        setError(true)
      }
    } catch {
      router.replace(systemErrorUrl)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleSignOut()}
        loading={pending}
        loadingLabel={t('actions.signingOut')}
      >
        {t('actions.signOut')}
      </Button>
      {error && <FeedbackMessage message={t('messages.signOutFailed')} isError />}
    </div>
  )
}
