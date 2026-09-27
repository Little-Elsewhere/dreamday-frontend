'use client'

import { useState, type ReactElement } from 'react'
import type { FieldValues } from 'react-hook-form'

import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/utils/cn'

import { PasswordToggle } from './password-toggle'

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
        <PasswordToggle
          shown={shown}
          onToggle={() => setShown((current) => !current)}
          showLabel={showLabel}
          hideLabel={hideLabel}
        />
      }
    />
  )
}
