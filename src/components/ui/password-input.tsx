'use client'

import { useState, type ReactElement } from 'react'
import type { FieldValues } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface PasswordInputProps<T extends FieldValues> extends Omit<
  InputProps<T>,
  'endAdornment' | 'type'
> {
  showLabel: string
  hideLabel: string
}

export function PasswordInput<T extends FieldValues>({
  showLabel,
  hideLabel,
  ...props
}: PasswordInputProps<T>): ReactElement {
  const [shown, setShown] = useState(false)

  return (
    <Input<T>
      {...props}
      className={cn('pr-14', props.className)}
      type={shown ? 'text' : 'password'}
      endAdornment={
        <Button
          variant="ghost"
          size="icon"
          className="text-ink-soft absolute top-1 right-1 rounded-md"
          type="button"
          onClick={() => setShown((current) => !current)}
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
      }
    />
  )
}
