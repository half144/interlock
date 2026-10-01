import type { Subagent } from "@/types";

const TICKS = [0, 0.25, 0.5, 0.75, 1];

/** One shared clock for every bar: a little past the latest moment anyone ran, so the newest bar never touches the edge. */
export function timelineScale(subs: Subagent[], now: number) {
  const end = Math.max(now, ...subs.map((s) => s.endSec ?? 0)) * 1.04;
  return {
    ticks: TICKS.map((f) => f * end),
    pos: (sec: number) => `${(sec / end) * 100}%`,
  };
}
