import type { Agent, Block, Message } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { statusLine } from "@/lib/agentStatus";

const working = (agent: Agent) => agent.aspect === "running" || agent.aspect === "queued";

/**
 * While a turn runs and nothing has come back yet, its reply is already on screen, empty. It takes the id the
 * timeline gives a new reply, so the first words land in it instead of replacing it.
 */
export function withPendingReply(messages: Message[], agent: Agent): Message[] {
  const last = messages.at(-1);
  if (!working(agent) || last?.role === "agent") return messages;
  const at = agent.turnStartedAt ?? last?.at ?? agent.updatedAt;
  return [
    ...messages,
    { id: `a-${messages.length}`, role: "agent", agentId: agent.id, blocks: [], at },
  ];
}

/** The line under the reply while the agent works, unless a plan step is already spinning for it. */
export function thinkingLine(agent: Agent, reply: Block[]): string | null {
  if (agent.aspect === "queued") return statusLine(agent);
  if (agent.aspect !== "running") return null;
  if (reply.some((b) => b.type === "step" && b.status === "in_progress")) return null;
  return reply.length === 0 ? `${agentLabel(agent)} is thinking` : "Thinking";
}
