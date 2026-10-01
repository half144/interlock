import type { AgentTaskItem } from "@interlock/protocol/agent-types";
import type { Block, PlanStatus } from "@/types";

export type PlanStep = Extract<Block, { type: "step" }>;

function fallbackStatus(item: AgentTaskItem, current: boolean): PlanStatus {
  if (item.completed) return "completed";
  return current ? "in_progress" : "pending";
}

export function todoToSteps(items: AgentTaskItem[]): PlanStep[] {
  const reported = items.some((item) => item.status !== undefined);
  const firstOpen = items.findIndex((item) => !item.completed);
  return items.map((item, index) => {
    const status: PlanStatus =
      item.status ?? fallbackStatus(item, !reported && index === firstOpen);
    return {
      type: "step",
      text: item.text,
      status,
      ...(item.activeForm ? { activeForm: item.activeForm } : {}),
    };
  });
}
