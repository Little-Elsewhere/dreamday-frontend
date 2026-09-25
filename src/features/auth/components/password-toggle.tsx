'use client'

import type { ReactElement } from 'react'
import { EyeIcon, EyeOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'

interface PasswordToggleProps {
  shown: boolean
  onToggle: () => void
  showLabel: string
  hideLabel: string
}

export function PasswordToggle({
  shown,
  onToggle,
  showLabel,
  hideLabel,
}: PasswordToggleProps): ReactElement {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-ink-soft absolute top-1 right-1 rounded-md"
      type="button"
      onClick={onToggle}
      aria-label={shown ? hideLabel : showLabel}
      aria-pressed={shown}
    >
      <HugeiconsIcon
        className="size-5"
        icon={shown ? EyeOffIcon : EyeIcon}
        size={20}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    </Button>
  )
}
