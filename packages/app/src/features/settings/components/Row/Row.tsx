import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RowProps {
  label: ReactNode;
  hint?: string;
  children: ReactNode;
  stack?: boolean;
}

/** Settings row: label and hint on the left, control on the right; `stack` puts a wide control underneath. */
export function Row({ label, hint, children, stack }: RowProps) {
  return (
    <div
      className={cn(
        "px-4 py-3.5",
        stack ? "flex flex-col gap-3" : "flex items-center justify-between gap-8",
      )}
    >
      <div className="min-w-0 max-w-[52ch]">
        <div className="text-[13px] text-ink">{label}</div>
        {hint && <p className="mt-0.5 text-[12.5px] leading-[1.5] text-ink-3">{hint}</p>}
      </div>
      <div className={stack ? "min-w-0" : "flex shrink-0 items-center gap-2"}>{children}</div>
    </div>
  );
}
