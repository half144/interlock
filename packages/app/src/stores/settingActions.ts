import * as daemon from "@/daemon/commands";
import { modeForAccess } from "@/daemon/adapters/modes";
import { patchAgent } from "./helpers";
import type { TaskSlice } from "./slices/tasks";
import type { AppState } from "./types";

type Set = (update: (state: AppState) => Partial<AppState> | AppState) => void;
type Actions = Pick<TaskSlice, "setAccess" | "setEffort" | "setModel">;

/** What a conversation runs with: autonomy level, reasoning effort and model. The pills show a change at once and take it back if the daemon refuses. */
export function settingActions(
  set: Set,
  get: () => AppState,
  attempt: (action: () => Promise<void>) => Promise<void>,
): Actions {
  const changeEffort = async (agentId: string, effort: string) => {
    const previous = get().agents[agentId]?.effort;
    set((s) => ({ agents: patchAgent(s.agents, agentId, { effort }) }));
    try {
      await daemon.setEffort(agentId, effort);
    } catch (error) {
      set((s) => ({ agents: patchAgent(s.agents, agentId, previous ? { effort: previous } : {}) }));
      throw error;
    }
  };

  const changeAccess: Actions["setAccess"] = async (agentId, access) => {
    const agent = get().agents[agentId];
    if (!agent) return;
    const { mode, modeId } = agent;
    set((s) => ({
      agents: patchAgent(s.agents, agentId, {
        mode: access === "plan" ? "plan" : "auto",
        modeId: modeForAccess(agent.kind, access),
      }),
    }));
    try {
      await daemon.setAccess(agent, access);
    } catch (error) {
      set((s) => ({ agents: patchAgent(s.agents, agentId, { mode, modeId }) }));
      throw error;
    }
  };

  return {
    setAccess: (agentId, access) => attempt(() => changeAccess(agentId, access)),
    setEffort: (agentId, effort) => attempt(() => changeEffort(agentId, effort)),
    setModel: (agentId, modelId) => attempt(() => daemon.setModel(agentId, modelId)),
  };
}
