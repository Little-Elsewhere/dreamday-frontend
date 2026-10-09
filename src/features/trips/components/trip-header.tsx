import { Add01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { io } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { ROUTES } from '@/constants/routes'
import { SignOutButton } from '@/features/auth/components/common/sign-out-button'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = {
  showCreate?: boolean
  showTripsLink?: boolean
}

const getAccountName = async (): Promise<string | null> => {
  await io()
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const metadata = data?.claims?.user_metadata

  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) return null

  const fullName = (metadata as Record<string, unknown>).full_name
  return typeof fullName === 'string' && fullName.trim() ? fullName : null
}

export const TripHeader = async ({
  showCreate = false,
  showTripsLink = false,
}: Props): Promise<ReactElement> => {
  const [t, accountName] = await Promise.all([getTranslations('trips'), getAccountName()])

  return (
    <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          prefetch
          href={ROUTES.PRIVATE.TRIPS}
          aria-label={t('navigation.brandLink')}
          className="text-primary focus-visible:outline-focus flex shrink-0 items-center gap-3 rounded-sm text-lg font-semibold tracking-[-0.04em] focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className="border-champagne text-champagne-ink grid size-9 place-items-center rounded-full border"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 16.5c3.5-1 5.7-3.4 6.6-7.2 2.1 2.8 4.5 4.4 7.4 4.7" />
              <path d="M6 19h12" />
            </svg>
          </span>
          {t('navigation.brand')}
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          {showTripsLink && (
            <Link
              prefetch
              href={ROUTES.PRIVATE.TRIPS}
              className="text-ink-soft hover:text-primary focus-visible:outline-focus inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-3"
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-4"
                icon={ArrowLeft02Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t('navigation.trips')}</span>
            </Link>
          )}
          <div className="hidden min-w-0 text-right sm:block">
            <strong className="text-primary block truncate text-sm font-medium">
              {accountName ?? t('navigation.accountNameFallback')}
            </strong>
            <span className="text-ink-soft block text-xs">{t('navigation.accountRole')}</span>
          </div>
          {showCreate && (
            <Link
              prefetch
              href={ROUTES.PRIVATE.TRIP_CREATE}
              aria-label={t('list.createTrip')}
              className="focus-visible:outline-focus rounded-auth bg-primary hover:bg-primary/90 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-3 text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-offset-3 sm:px-4"
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-4"
                icon={Add01Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span className="hidden sm:inline">{t('list.createTrip')}</span>
            </Link>
          )}
          <SignOutButton compactLabel />
        </div>
      </div>
    </header>
  )
}
