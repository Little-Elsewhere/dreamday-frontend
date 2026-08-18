'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type FormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentProps<typeof Checkbox>,
  'name' | 'checked' | 'defaultChecked' | 'onCheckedChange' | 'onBlur'
> & {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
}

export function FormCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  ...props
}: FormCheckboxProps<TFieldValues>) {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid grid-cols-[auto_1fr] items-start gap-3">
          <Checkbox
            {...props}
            id={id}
            name={field.name}
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            aria-describedby={description ? descriptionId : errorId}
            aria-invalid={fieldState.invalid}
          />
          <div className="grid gap-1">
            <Label htmlFor={id}>{label}</Label>
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
        </div>
      )}
    />
  )
}
