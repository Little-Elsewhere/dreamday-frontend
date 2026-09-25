'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

interface FormInputProps<TFieldValues extends FieldValues> extends Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
  errorMessage?: React.ReactNode
  containerClassName?: string
  labelClassName?: string
  endAdornment?: React.ReactNode
}

export function FormInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  errorMessage,
  containerClassName,
  labelClassName,
  endAdornment,
  id,
  ...props
}: FormInputProps<TFieldValues>) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('grid min-w-0 gap-2', containerClassName)}>
          <Label className={labelClassName} htmlFor={inputId}>
            {label}
          </Label>
          <div className={endAdornment ? 'relative' : undefined}>
            <Input
              {...props}
              {...field}
              id={inputId}
              ref={field.ref}
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
              {errorMessage ?? String(fieldState.error.message)}
            </p>
          )}
        </div>
      )}
    />
  )
}
