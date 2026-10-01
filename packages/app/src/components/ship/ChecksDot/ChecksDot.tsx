import type { ChecksState } from "@/lib/checks";
import { cn } from "@/lib/utils";

const TONE: Record<ChecksState, string> = {
  none: "bg-ink-4",
  pending: "animate-lamp-hold bg-hold",
  failing: "bg-red",
  passing: "bg-green",
};

export function ChecksDot({ state, className }: { state: ChecksState; className?: string }) {
  return (
    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", TONE[state], className)} />
  );
}
