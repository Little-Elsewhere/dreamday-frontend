'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type FormSelectOption = {
  label: React.ReactNode
  value: string
}

type FormSelectProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
  options: readonly FormSelectOption[]
  disabled?: boolean
}

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  placeholder,
  options,
  disabled,
}: FormSelectProps<TFieldValues>) {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-2">
          <Label htmlFor={id}>{label}</Label>
          <Select
            items={options}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-describedby={description ? descriptionId : errorId}
              aria-invalid={fieldState.invalid}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
