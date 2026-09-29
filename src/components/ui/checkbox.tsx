'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { useTranslations } from 'next-intl'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

interface CheckboxProps<TFieldValues extends FieldValues> extends Omit<
  CheckboxPrimitive.Root.Props,
  'name' | 'checked' | 'defaultChecked' | 'onCheckedChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
}

const Checkbox = <TFieldValues extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: CheckboxProps<TFieldValues>): React.ReactElement => {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const { control } = useFormContext<TFieldValues>()
  const t = useTranslations()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid grid-cols-[auto_1fr] items-start gap-3">
          <CheckboxPrimitive.Root
            {...props}
            data-slot="checkbox"
            className={cn(
              'peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-[6px] border transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px]',
              className,
            )}
            id={id}
            name={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            aria-describedby={
              [description ? descriptionId : null, fieldState.error ? errorId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-invalid={fieldState.invalid}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
            >
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <div className="grid gap-1">
            <Label htmlFor={id}>{label}</Label>
            {description && (
              <p id={descriptionId} className="text-muted-foreground text-sm">
                {description}
              </p>
            )}
            {fieldState.error?.message && (
              <p id={errorId} role="alert" className="text-error-text text-sm">
                {t(fieldState.error.message)}
              </p>
            )}
          </div>
        </div>
      )}
    />
  )
}

export { Checkbox }
