'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> & {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
}

export function FormInput<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  ...props
}: FormInputProps<TFieldValues>) {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-2">
          <Label htmlFor={id}>{label}</Label>
          <Input
            {...props}
            {...field}
            id={id}
            aria-describedby={description ? descriptionId : errorId}
            aria-invalid={fieldState.invalid}
          />
          {description && (
            <p id={descriptionId} className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
          {fieldState.error?.message && (
            <p id={errorId} role="alert" className="text-destructive text-sm font-medium">
              {String(fieldState.error.message)}
            </p>
          )}
        </div>
      )}
    />
  )
}
