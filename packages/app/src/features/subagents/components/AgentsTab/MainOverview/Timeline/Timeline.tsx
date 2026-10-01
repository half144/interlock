import type { Subagent } from "@/types";
import { clock } from "@/lib/clock";
import { timelineScale } from "@/features/subagents/utils/timeline";
import { TimelineRow } from "./TimelineRow/TimelineRow";

/** When each subagent ran, on one shared clock, so overlap (parallel work) is visible at a glance. */
export function Timeline({
  subs,
  now,
  onPick,
}: {
  subs: Subagent[];
  now: number;
  onPick: (id: string) => void;
}) {
  const { ticks, pos } = timelineScale(subs, now);

  return (
    <div className="mt-5 rounded-xl border border-seam p-4">
      <div className="grid grid-cols-[120px_1fr] gap-x-3">
        <span />
        <div className="relative mb-2 h-4 text-[11px] text-ink-4">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 font-mono tabular-nums first:translate-x-0 last:-translate-x-full"
              style={{ left: pos(t) }}
            >
              {clock(t)}
            </span>
          ))}
        </div>
        {subs.map((s) => (
          <TimelineRow key={s.id} sub={s} now={now} pos={pos} onPick={onPick} />
        ))}
      </div>
      <p className="mt-3 flex items-center gap-4 text-[12px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-ink-3" />
          Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-run" />
          Working
        </span>
        <span className="ml-auto font-mono tabular-nums">now {clock(now)}</span>
      </p>
    </div>
  );
}
