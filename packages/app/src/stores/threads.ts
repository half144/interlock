import { currentStep, withTrailingBlocks } from "@/daemon/adapters/timeline";
import type { Agent, Message, Thread } from "@/types";

const CHANGE_ASPECTS = new Set(["review", "merged"]);

/**
 * What an agent update does to the replica: it keeps the reader's unseen count, takes its step line from
 * the live plan when the agent is running, and keeps the hold and changes cards at the end of the thread.
 */
export function mergeAgent(
  prev: Agent | undefined,
  next: Agent,
  thread: Thread | undefined,
): { agent: Agent; thread: Thread } {
  const base = thread?.messages ?? [];
  const messages = withTrailingBlocks(base, next.id, {
    hold: next.hold !== undefined,
    changes: CHANGE_ASPECTS.has(next.aspect),
  });
  const step = next.aspect === "running" ? currentStep(messages) : null;
  return {
    agent: { ...next, unseen: prev?.unseen ?? 0, step: step ?? next.step },
    thread: {
      id: next.id,
      projectId: next.projectId,
      title: next.title,
      updatedAt: next.updatedAt,
      agentIds: [next.id],
      messages,
    },
  };
}

export const withMessage = (thread: Thread, message: Message): Thread => ({
  ...thread,
  updatedAt: message.at,
  messages: [...thread.messages, message],
});

export const withoutMessage = (thread: Thread, id: string): Thread => ({
  ...thread,
  messages: thread.messages.filter((m) => m.id !== id),
});
