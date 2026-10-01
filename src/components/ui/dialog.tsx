'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { ComponentProps, ReactElement } from 'react'

import { cn } from '@/utils/cn'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

interface DialogOverlayProps extends ComponentProps<typeof DialogPrimitive.Backdrop> {
  className?: string
}

const DialogOverlay = ({ className, ...props }: DialogOverlayProps): ReactElement => {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/80 duration-100 supports-backdrop-filter:backdrop-blur-xs',
        className,
      )}
      {...props}
    />
  )
}

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Popup> {
  overlayClassName?: string
}

const DialogContent = ({
  children,
  className,
  overlayClassName,
  ...props
}: DialogContentProps): ReactElement => {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'bg-popover text-popover-foreground ring-foreground/5 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl p-6 text-sm ring-1 duration-100 outline-none sm:max-w-md',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

interface DialogHeaderProps extends ComponentProps<'div'> {
  className?: string
}

const DialogHeader = ({ className, ...props }: DialogHeaderProps): ReactElement => {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

interface DialogFooterProps extends ComponentProps<'div'> {
  className?: string
}

const DialogFooter = ({ className, ...props }: DialogFooterProps): ReactElement => {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

interface DialogTitleProps extends ComponentProps<typeof DialogPrimitive.Title> {
  className?: string
}

const DialogTitle = ({ className, ...props }: DialogTitleProps): ReactElement => {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

interface DialogDescriptionProps extends ComponentProps<typeof DialogPrimitive.Description> {
  className?: string
}

const DialogDescription = ({ className, ...props }: DialogDescriptionProps): ReactElement => {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
