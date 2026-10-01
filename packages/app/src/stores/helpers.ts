import type { Agent, Message, Thread } from "@/types";

let messageSeq = 0;
let toastSeq = 0;

export const nextMessageId = () => `m-${++messageSeq}`;
export const nextToastId = () => ++toastSeq;

/** Appends messages and marks the thread as just updated. */
export const appendMessages = (thread: Thread, ...messages: Message[]): Thread => ({
  ...thread,
  updatedMin: 0,
  messages: [...thread.messages, ...messages],
});

/** Returns the agents with one of them patched; unchanged when the id is unknown. */
export const patchAgent = (
  agents: Record<string, Agent>,
  id: string,
  patch: Partial<Agent>,
): Record<string, Agent> => {
  const agent = agents[id];
  return agent ? { ...agents, [id]: { ...agent, ...patch } } : agents;
};
