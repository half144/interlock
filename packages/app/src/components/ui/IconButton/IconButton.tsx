import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/styles";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** A 28px square icon-only control for toolbars and headers. `label` becomes its accessible name and tooltip. */
export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-selected hover:text-ink enabled:active:scale-[0.92] [&_svg]:size-4",
        pressable,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
