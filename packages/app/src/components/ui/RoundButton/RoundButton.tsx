import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/styles";

const variants = {
  solid: "bg-ink text-ground hover:bg-white disabled:bg-selected disabled:text-ink-4",
  outline: "border border-seam text-ink-2 hover:bg-hover",
  ghost: "text-ink-2 hover:bg-hover",
};

interface RoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: keyof typeof variants;
}

/** The 32px circular button used around composers and the top bar. */
export function RoundButton({
  label,
  variant = "ghost",
  className,
  children,
  ...rest
}: RoundButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full enabled:active:scale-[0.92] [&_svg]:size-4",
        pressable,
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
