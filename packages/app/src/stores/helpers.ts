import type { Agent } from "@/types";

let toastSeq = 0;

export const nextToastId = () => ++toastSeq;

/** Returns the agents with one of them patched; unchanged when the id is unknown. */
export const patchAgent = (
  agents: Record<string, Agent>,
  id: string,
  patch: Partial<Agent>,
): Record<string, Agent> => {
  const agent = agents[id];
  return agent ? { ...agents, [id]: { ...agent, ...patch } } : agents;
};
