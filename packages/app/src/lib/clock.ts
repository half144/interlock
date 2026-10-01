import type { Agent, Subagent } from "@/types";

const LIVE = new Set(["running", "held", "queued"]);

/** Seconds into a task, the clock subagent timings are measured on. A task that stopped keeps the time it stopped at. */
export const taskClock = (agent: Agent, now = Date.now()) =>
  Math.max(
    0,
    Math.round(((LIVE.has(agent.aspect) ? now : agent.updatedAt) - agent.createdAt) / 1000),
  );

export function elapsedOf(sub: Subagent, agent: Agent) {
  if (sub.status === "queued") return 0;
  return (sub.endSec ?? taskClock(agent)) - sub.startSec;
}

export function duration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

export const clock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`;
