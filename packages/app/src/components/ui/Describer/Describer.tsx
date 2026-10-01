import type { Aspect } from "@/types";
import { cn } from "@/lib/utils";

interface DescriberProps {
  headcode: string;
  aspect?: Aspect;
  className?: string;
}

/** The agent's key, quiet like an issue ID. */
export function Describer({ headcode, aspect, className }: DescriberProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center font-mono text-[11.5px] leading-none tracking-[-0.01em] text-ink-3 tabular-nums",
        aspect === "discarded" && "line-through decoration-ink-4",
        className,
      )}
    >
      {headcode}
    </span>
  );
}
