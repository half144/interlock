import { cn } from "@/lib/utils";
import type { RingState } from "@/lib/usage";

const SIZE = 16;
const STROKE = 2.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** What is left of a window as an arc: neutral, amber when low, dimmed when there is nothing to show. */
export function UsageRing({ state }: { state: RingState }) {
  const remaining = state.kind === "unavailable" ? 0 : state.remainingPct;

  return (
    <svg
      aria-hidden
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn(
        "-rotate-90",
        state.kind === "low" ? "text-hold" : "text-ink-2",
        state.kind === "unavailable" && "opacity-40",
      )}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="opacity-25"
      />
      {remaining > 0 && (
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - remaining / 100)}
        />
      )}
    </svg>
  );
}
