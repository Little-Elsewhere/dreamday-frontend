'use client'

import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useLocale, useTranslations } from 'next-intl'
import { type ReactElement, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Locale } from '@/constants/locale'
import { signOut } from '@/features/auth/actions/auth'

type Props = {
  compactLabel?: boolean
}

export const SignOutButton = ({ compactLabel = false }: Props): ReactElement => {
  const t = useTranslations('account')
  const locale = useLocale() as Locale
  const [pending, setPending] = useState(false)

  const handleSignOut = async (): Promise<void> => {
    setPending(true)

    try {
      await signOut(locale)
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={compactLabel ? 'min-h-11 gap-2 px-3 sm:px-4' : undefined}
      aria-label={compactLabel ? t('actions.signOut') : undefined}
      onClick={() => void handleSignOut()}
      loading={pending}
      loadingLabel={t('actions.signingOut')}
    >
      {compactLabel && (
        <HugeiconsIcon
          aria-hidden="true"
          className="size-4"
          icon={Logout01Icon}
          size={16}
          strokeWidth={1.7}
        />
      )}
      <span className={compactLabel ? 'hidden sm:inline' : undefined}>{t('actions.signOut')}</span>
    </Button>
  )
}
