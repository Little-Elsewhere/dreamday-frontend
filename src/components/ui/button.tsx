import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-auth border bg-clip-padding text-sm leading-5 font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-focus focus-visible:ring-[3px] focus-visible:ring-focus/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-[3px] aria-invalid:ring-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:border-line disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
        outline:
          'border-line-strong bg-surface text-primary hover:border-primary hover:bg-paper aria-expanded:border-primary aria-expanded:bg-paper disabled:border-line disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
        secondary:
          'border-transparent bg-muted text-ink hover:bg-paper aria-expanded:bg-muted aria-expanded:text-ink',
        ghost:
          'border-transparent bg-transparent text-primary hover:bg-muted hover:text-primary aria-expanded:bg-muted aria-expanded:text-primary',
        destructive:
          'border-error bg-error-bg text-error hover:bg-error-bg/80 focus-visible:border-error focus-visible:ring-error/20',
        link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:bg-transparent hover:underline',
      },
      size: {
        default:
          'min-h-11 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: "min-h-8 gap-1 px-2.5 py-1 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: 'min-h-9 gap-1.5 px-3 py-1.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        lg: 'min-h-12 gap-2.5 px-6 py-3 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-11',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-9',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingLabel?: ReactNode
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  loading = false,
  loadingLabel,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      {...props}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      aria-busy={loading || props['aria-busy']}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          data-icon="inline-start"
        />
      )}
      {loading ? (loadingLabel ?? children) : children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
