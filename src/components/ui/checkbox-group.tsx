'use client'

import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { useTranslations } from 'next-intl'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import { checkboxClassName } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { Tick02Icon } from '@hugeicons/core-free-icons'

interface CheckboxGroupOption {
  value: string
  label: string
}

interface CheckboxGroupProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  options: CheckboxGroupOption[]
  className?: string
}

const CheckboxGroup = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  options,
  className,
}: CheckboxGroupProps<TFieldValues>): React.ReactElement => {
  const id = React.useId()
  const errorId = `${id}-error`
  const { control } = useFormContext<TFieldValues>()
  const t = useTranslations()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValues = Array.isArray(field.value)
          ? field.value.filter((value: unknown): value is string => typeof value === 'string')
          : []

        return (
          <fieldset
            className={cn('grid gap-3', className)}
            data-invalid={fieldState.invalid || undefined}
          >
            <legend className="text-sm font-medium">{label}</legend>
            <div className="flex flex-wrap gap-3">
              {options.map((option, index) => {
                const inputId = `${id}-${index}`
                const checked = selectedValues.includes(option.value)

                return (
                  <div key={option.value} className="flex items-center gap-2 text-sm">
                    <CheckboxPrimitive.Root
                      id={inputId}
                      name={field.name}
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        field.onChange(
                          nextChecked
                            ? [...new Set([...selectedValues, option.value])]
                            : selectedValues.filter((value: string) => value !== option.value),
                        )
                      }
                      onBlur={field.onBlur}
                      aria-label={option.label}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.error ? errorId : undefined}
                      className={checkboxClassName}
                    >
                      <CheckboxPrimitive.Indicator className="grid place-content-center text-current transition-none [&>svg]:size-3.5">
                        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                      </CheckboxPrimitive.Indicator>
                    </CheckboxPrimitive.Root>
                    <Label htmlFor={inputId} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
            {fieldState.error?.message && (
              <p id={errorId} role="alert" className="text-error-text text-sm">
                {t(fieldState.error.message)}
              </p>
            )}
          </fieldset>
        )
      }}
    />
  )
}

export { CheckboxGroup }
