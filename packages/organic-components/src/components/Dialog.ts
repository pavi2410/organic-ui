import { cva } from "cva"
import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

const dialogVariants = cva({
  base: "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  variants: {},
  defaultVariants: {}
})

export interface DialogProps {
  class?: string
  children?: any
  open?: boolean
}

function DialogRoot({
  class: className,
  children,
  open,
  ...props
}: DialogProps) {
  if (!open) return null

  return h.div({
    class: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
    children: [
      h.div({
        class: cn(dialogVariants(), className),
        children,
        ...props
      } as any)
    ]
  })
}

export interface DialogHeaderProps {
  class?: string
  children?: any
}

export function DialogHeader({
  class: className,
  children,
  ...props
}: DialogHeaderProps) {
  return h.div({
    class: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
    children,
    ...props
  } as any)
}

export interface DialogTitleProps {
  class?: string
  children?: any
}

export function DialogTitle({
  class: className,
  children,
  ...props
}: DialogTitleProps) {
  return h.div({
    class: cn("text-lg font-semibold leading-none tracking-tight", className),
    children,
    ...props
  } as any)
}

export interface DialogDescriptionProps {
  class?: string
  children?: any
}

export function DialogDescription({
  class: className,
  children,
  ...props
}: DialogDescriptionProps) {
  return h.div({
    class: cn("text-sm text-muted-foreground", className),
    children,
    ...props
  } as any)
}

export interface DialogContentProps {
  class?: string
  children?: any
}

export function DialogContent({
  class: className,
  children,
  ...props
}: DialogContentProps) {
  return h.div({
    class: cn("grid gap-4 py-4", className),
    children,
    ...props
  } as any)
}

export interface DialogFooterProps {
  class?: string
  children?: any
}

export function DialogFooter({
  class: className,
  children,
  ...props
}: DialogFooterProps) {
  return h.div({
    class: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    children,
    ...props
  } as any)
}

export interface DialogCloseProps {
  class?: string
  children?: any
  onClick: () => void
}

export function DialogClose({
  class: className,
  children,
  onClick,
  ...props
}: DialogCloseProps) {
  return h.button({
    class: cn("absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", className),
    onClick,
    text: children || "×",
    ...props
  } as any)
}

export const Dialog = {
  Root: DialogRoot,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Content: DialogContent,
  Footer: DialogFooter,
  Close: DialogClose
}
