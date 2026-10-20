import { cva } from "class-variance-authority"

export const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                destructive:
                    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                emerald:
                    "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 border-emerald-200",
                amber:
                    "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50/80 border-amber-200",
                blue:
                    "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50/80 border-blue-200",
                slate:
                    "border-transparent bg-slate-50 text-slate-700 hover:bg-slate-50/80 border-slate-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)
