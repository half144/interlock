import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/styles";

const variants = {
  primary:
    "bg-ink text-ground shadow-button hover:bg-white active:bg-ink-2 disabled:bg-ink/25 disabled:shadow-none",
  secondary:
    "border border-seam-2 bg-raised text-ink shadow-button hover:bg-raised-2 active:bg-inset disabled:text-ink-4 disabled:hover:bg-raised",
  ghost:
    "text-ink-2 hover:bg-selected hover:text-ink active:bg-selected disabled:text-ink-4 disabled:hover:bg-transparent",
  danger:
    "border border-seam-2 bg-raised text-red hover:border-red/50 hover:bg-red/10 focus-visible:border-red/50",
};

const sizes = {
  sm: "h-7 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-[13.5px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: ReactNode;
}

/** A labelled button. One `primary` per region; everything else is secondary, ghost or a pill. */
export function Button({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap enabled:active:scale-[0.97] [&_svg]:size-3.5 [&_svg]:shrink-0",
        pressable,
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
