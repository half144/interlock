import type { Agent, Aspect, PlanStatus, Thread } from "@/types";
import { isFinished, statusLine } from "@/lib/agentStatus";
import { planProgress } from "./planSteps";

type CardTone = "shimmer" | "hold" | "muted";
export type MarkKind = "step" | "review" | "merged";
export interface CardStatus {
  text: string;
  tone: Exclude<CardTone, "muted">;
}

const STATUS_TONE: Partial<Record<Aspect, CardTone>> = { running: "shimmer", held: "hold" };

function markOf(agent: Agent): MarkKind {
  if (agent.aspect === "merged") return "merged";
  return isFinished(agent) ? "review" : "step";
}

/**
 * The line under the step, only when the card is the one saying it: the agent waiting on you, or thinking inside
 * the step it's on. Between steps the conversation says it is thinking, and the step's own name says the rest.
 */
function liveStatus(agent: Agent, step: PlanStatus | undefined): CardStatus | null {
  if (agent.aspect === "held") return { text: statusLine(agent), tone: "hold" };
  if (agent.aspect === "running" && step === "in_progress")
    return { text: "Thinking", tone: "shimmer" };
  return null;
}

/**
 * What the worktree card says: the headline step, the status line under it, and the counter on the right. A
 * finished plan keeps its count; the outcome itself is said once, in the conversation.
 */
export function worktreeCardLine(agent: Agent, thread: Thread) {
  const progress = planProgress(agent, thread);
  const statusText = statusLine(agent);
  const live = liveStatus(agent, progress.statuses[progress.index]);

  return {
    ...progress,
    finished: isFinished(agent),
    live,
    statusText,
    statusTone: STATUS_TONE[agent.aspect] ?? "muted",
    headline: progress.headline ?? statusText,
    mark: markOf(agent),
    rowHeight: live ? 56 : 40,
    counter: `${progress.done} / ${progress.steps.length}`,
  };
}
