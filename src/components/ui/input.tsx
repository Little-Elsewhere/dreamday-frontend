'use client'

import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { useTranslations } from 'next-intl'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

export interface InputProps<TFieldValues extends FieldValues> extends Omit<
  React.ComponentProps<'input'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  endAdornment?: React.ReactNode
}

function Input<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  containerClassName,
  labelClassName,
  endAdornment,
  id,
  ...props
}: InputProps<TFieldValues>): React.ReactElement {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const { control } = useFormContext<TFieldValues>()
  const t = useTranslations()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('grid min-w-0 gap-2', containerClassName)}>
          <Label className={labelClassName} htmlFor={inputId}>
            {label}
          </Label>
          <div className={endAdornment ? 'relative' : undefined}>
            <InputPrimitive
              {...props}
              {...field}
              type={props.type}
              id={inputId}
              ref={field.ref}
              data-slot="input"
              className={cn(
                'rounded-auth border-line-strong bg-field text-ink placeholder:text-placeholder hover:border-primary focus-visible:border-primary focus-visible:ring-primary/10 aria-invalid:border-error aria-invalid:ring-error/20 block min-h-12 w-full min-w-0 border px-3 py-3 font-[inherit] text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:bg-white focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
                props.className,
              )}
              aria-describedby={
                [description ? descriptionId : null, fieldState.error ? errorId : null]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              aria-invalid={fieldState.invalid}
            />
            {endAdornment}
          </div>
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
      )}
    />
  )
}

export { Input }
