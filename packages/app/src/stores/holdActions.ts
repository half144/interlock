import * as daemon from "@/daemon/commands";
import type { TaskSlice } from "./slices/tasks";
import type { AppState } from "./types";

type Actions = Pick<TaskSlice, "resolveHold" | "resolveQuestions" | "resolvePlan">;

/** Answers to what the agent is waiting on. Each acts on the hold the agent has at that moment. */
export function holdActions(
  get: () => AppState,
  attempt: (action: () => Promise<void>) => Promise<void>,
): Actions {
  return {
    resolveHold: (agentId, option) =>
      attempt(async () => {
        const hold = get().agents[agentId]?.hold;
        if (hold) await daemon.answerHold(agentId, hold, option);
      }),
    resolveQuestions: (agentId, answers) =>
      attempt(async () => {
        const hold = get().agents[agentId]?.hold;
        if (hold) await daemon.answerQuestions(agentId, hold, answers);
      }),
    resolvePlan: (agentId, choice) =>
      attempt(async () => {
        const agent = get().agents[agentId];
        if (agent?.hold) await daemon.answerPlan(agent, agent.hold, choice);
      }),
  };
}
