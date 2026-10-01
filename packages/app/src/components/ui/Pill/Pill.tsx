import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const pill =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-seam px-3 text-[13px] text-ink";

/** The 32px bordered capsule next to composers and in the top bar: a control, or (`as="span"`) a read-out. */
export function Pill({
  as = "button",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" | "span"; children: ReactNode }) {
  if (as === "span")
    return (
      <span className={cn(pill, className)} title={rest.title}>
        {children}
      </span>
    );
  return (
    <button
      type="button"
      className={cn(pill, "transition-colors hover:bg-hover", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
