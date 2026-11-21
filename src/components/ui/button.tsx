import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
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

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

/** Кнопка в стиле shadcn/ui — используется в React-островах (портфолио). */
export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
