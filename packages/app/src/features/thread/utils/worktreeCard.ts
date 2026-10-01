import type { Agent, Aspect, Thread } from "@/types";
import { finishedLabel, isFinished, statusLine } from "@/lib/agentStatus";
import { planProgress } from "./planSteps";

export type CardTone = "shimmer" | "hold" | "muted" | "merge" | "green";
export type MarkKind = "step" | "review" | "merged";

const STATUS_TONE: Partial<Record<Aspect, CardTone>> = { running: "shimmer", held: "hold" };

function markOf(agent: Agent): MarkKind {
  if (agent.aspect === "merged") return "merged";
  return isFinished(agent) ? "review" : "step";
}

/** What the worktree card says: the headline step, the status line under it, and the counter on the right. */
export function worktreeCardLine(agent: Agent, thread: Thread, expanded: boolean) {
  const progress = planProgress(agent, thread);
  const finished = isFinished(agent);
  const statusText = statusLine(agent);
  const settled = finished && !expanded;
  const finishedTone: CardTone = agent.aspect === "merged" ? "merge" : "green";

  return {
    ...progress,
    finished,
    statusText,
    statusTone: STATUS_TONE[agent.aspect] ?? "muted",
    headline: progress.headline ?? statusText,
    mark: markOf(agent),
    rowHeight: finished || !progress.current ? 40 : 56,
    counter: settled ? finishedLabel(agent) : `${progress.done} / ${progress.steps.length}`,
    counterTone: settled ? finishedTone : ("muted" as const),
  };
}
