import { cva } from "class-variance-authority";

/**
 * Кнопка в стиле shadcn/ui (cva-варианты).
 * Те же классы используются и в Astro-верстке через .btn / .btn-primary (см. global.css).
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition duration-200 ease-out-expo outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-fg text-black shadow-btn hover:-translate-y-px hover:bg-white",
        outline:
          "border border-line-strong bg-white/[0.03] text-fg hover:border-white/30 hover:bg-white/[0.07]",
        ghost: "text-fg-muted hover:bg-white/[0.04] hover:text-fg",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-13 px-6 text-[15px]",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export const badgeVariants = cva(
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
