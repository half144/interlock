import type { Activity, Notice } from "@/platform/desktop";
import type { Agent } from "@/types";

export type AttentionReason = "finished" | "error" | "permission";

function bodyOf(agent: Agent, reason: AttentionReason): string {
  switch (reason) {
    case "permission":
      return `Needs you: ${agent.hold?.command ?? agent.hold?.file ?? agent.hold?.title ?? "approval"}`;
    case "error":
      return `Failed: ${agent.error ?? "the agent stopped"}`;
    case "finished":
      return "Ready for review";
  }
}

export function toNotice(agent: Agent, reason: AttentionReason): Notice | null {
  return { title: agent.title, body: bodyOf(agent, reason), taskId: agent.id };
}

export function activityOf(agents: Agent[]): Activity {
  const waiting = new Set(["held", "failed", "review"]);
  return {
    running: agents.filter((a) => a.aspect === "running").length,
    waiting: agents.filter((a) => waiting.has(a.aspect)).length,
  };
}
