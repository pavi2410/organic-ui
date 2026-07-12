import { cva, type VariantProps } from "cva"
import { h } from "organic-ui"
import { cn } from "../lib/utils.js"

const badgeVariants = cva({
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface BadgeProps
  extends VariantProps<typeof badgeVariants> {
  class?: string
  children?: any
}

export function Badge({
  class: className,
  variant,
  children,
  ...props
}: BadgeProps) {
  return h.div({
    class: cn(badgeVariants({ variant }), className),
    children,
    ...props
  } as any)
}
