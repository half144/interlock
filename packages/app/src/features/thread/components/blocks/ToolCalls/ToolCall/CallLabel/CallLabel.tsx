import type { ToolChip } from "@/types";
import { cn } from "@/lib/utils";

/** The verb quiet and the target brighter; a call that's still running shimmers as one line. */
export function CallLabel({ chip }: { chip: ToolChip }) {
  if (chip.status === "running") {
    return <span className="min-w-0 truncate shimmer">{chip.label}</span>;
  }
  return (
    <span className={cn("min-w-0 truncate", chip.target ? "text-ink-3" : "text-ink-2")}>
      {chip.verb}
      {chip.target && (
        <span className={cn("text-ink-2", chip.literal && "font-mono text-[12px]")}>
          {` ${chip.target}`}
        </span>
      )}
    </span>
  );
}
