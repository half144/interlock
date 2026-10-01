import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A narrower strip tucked under the composer, so it reads as cut off by it, for context about where the message goes. The composer above it needs `relative z-10`; callers set the padding. */
export function ComposerTray({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-6 -mt-4 flex items-center gap-2 rounded-b-2xl border border-t-0 border-seam bg-inset text-[12px] text-ink-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
