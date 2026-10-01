import type { FileDiff } from "@/types";
import { patchAgent } from "../helpers";
import type { SliceCreator } from "../types";

export interface DiffSlice {
  /** The changed files of each agent's worktree, by agent id. Only the open task has them. */
  diffs: Record<string, FileDiff[]>;
  setDiff: (agentId: string, files: FileDiff[]) => void;
}

export const createDiffSlice: SliceCreator<DiffSlice> = (set) => ({
  diffs: {},

  setDiff: (agentId, files) =>
    set((s) => ({
      diffs: { ...s.diffs, [agentId]: files },
      agents: patchAgent(s.agents, agentId, { files: files.map((f) => f.path) }),
    })),
});
