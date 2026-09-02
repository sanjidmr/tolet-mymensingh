import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600 text-white shadow-xs",
        secondary:
          "border-stone-200 bg-stone-100 text-stone-800",
        destructive:
          "border-transparent bg-rose-500 text-white",
        outline: "text-stone-700 border-stone-300",
        verified:
          "border-emerald-200 bg-emerald-50 text-emerald-800 font-medium",
        featured:
          "border-amber-200 bg-amber-50 text-amber-900 font-medium",
        family:
          "border-sky-200 bg-sky-50 text-sky-800",
        bachelor:
          "border-violet-200 bg-violet-50 text-violet-800",
        student:
          "border-indigo-200 bg-indigo-50 text-indigo-800",
        female:
          "border-pink-200 bg-pink-50 text-pink-800",
        rented:
          "border-stone-300 bg-stone-200 text-stone-600 line-through",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}
