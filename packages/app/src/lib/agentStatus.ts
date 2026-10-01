import type { Agent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";

/** The work is done: ready for review or already merged. */
export const isFinished = (agent: Agent) => agent.aspect === "review" || agent.aspect === "merged";

/** How a finished task names its state. */
export function finishedLabel(agent: Agent) {
  if (agent.aspect !== "merged") return "Ready for review";
  return agent.pr ? `Merged as #${agent.pr}` : "Merged";
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** One line on what the agent is up to, in its own name: "Claude Code is writing migration 0142". */
export function statusLine(agent: Agent) {
  const name = agentLabel(agent);
  switch (agent.aspect) {
    case "running":
      return `${name} is ${lower(agent.step)}`;
    case "held":
      return `${name} is waiting for you`;
    case "review":
      return `${name} finished · ready for review`;
    case "idle":
      return `${name} is idle`;
    case "merged":
      return `${name} is idle · merged`;
    case "queued":
      return `${name} will start soon`;
    default:
      return `${name} stopped`;
  }
}
