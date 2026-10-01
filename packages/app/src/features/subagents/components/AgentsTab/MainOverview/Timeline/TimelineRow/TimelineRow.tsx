import { useReducedMotion } from "motion/react";
import type { Subagent } from "@/types";
import { cn } from "@/lib/utils";
import { clock } from "@/lib/clock";

// Bars move linearly over the store's 1.4s tick, so time reads as flowing instead of stepping.
const glide = "left 1.4s linear, width 1.4s linear, background-color 150ms";

interface TimelineRowProps {
  sub: Subagent;
  now: number;
  pos: (sec: number) => string;
  onPick: (id: string) => void;
}

export function TimelineRow({ sub, now, pos, onPick }: TimelineRowProps) {
  const reduce = useReducedMotion();
  const start = sub.startSec;
  const stop = sub.endSec ?? now;

  return (
    <div className="contents">
      <button
        type="button"
        onClick={() => onPick(sub.id)}
        className="truncate py-1.5 text-left text-[13px] text-ink-2 hover:text-ink"
      >
        {sub.name}
      </button>
      <div className="relative h-8">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-seam" />
        <button
          type="button"
          onClick={() => onPick(sub.id)}
          aria-label={`${sub.name}, ${clock(start)} to ${sub.endSec ? clock(stop) : "now"}`}
          className={cn(
            "absolute top-1/2 h-3 -translate-y-1/2 rounded-full",
            sub.status === "running" ? "bg-run" : "bg-ink-3 hover:bg-ink-2",
          )}
          style={{
            left: pos(start),
            width: `max(6px, calc(${pos(stop)} - ${pos(start)}))`,
            transition: reduce ? undefined : glide,
          }}
        />
      </div>
    </div>
  );
}
