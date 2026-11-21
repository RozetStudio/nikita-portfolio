import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted",
  {
    variants: {
      tone: {
        default: "",
        strong: "border-line-strong bg-white/[0.08] text-fg",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Бейдж в стиле shadcn/ui — используется в React-островах (карточки портфолио). */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
