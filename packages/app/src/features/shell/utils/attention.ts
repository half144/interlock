import type { Agent } from "@/types";

/** Projects with a task that is waiting on you or has failed. */
export function projectsNeedingYou(agents: Record<string, Agent>): Set<string> {
  return new Set(
    Object.values(agents)
      .filter((a) => a.aspect === "held" || a.aspect === "failed")
      .map((a) => a.projectId),
  );
}
