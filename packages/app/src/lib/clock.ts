import type { Agent, Subagent } from "@/types";

/**
 * Seconds into a task, the clock subagent timings are measured on. Until providers send real
 * timestamps it is derived from when the task started and how far along it is.
 */
export const taskClock = (agent: Agent) => Math.round(agent.startedMin * 60 + agent.progress * 120);

export function elapsedOf(sub: Subagent, agent: Agent) {
  if (sub.status === "queued") return 0;
  return (sub.endSec ?? taskClock(agent)) - sub.startSec - (sub.idleSec ?? 0);
}

export function duration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

export const clock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`;
