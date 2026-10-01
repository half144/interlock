import type { Subagent } from "@/types";
import { aboutSubagent } from "@/lib/subagentMessage";
import type { SliceCreator } from "../types";

export interface SubagentSlice {
  subagents: Record<string, Subagent>;

  replaceSubagents: (parentId: string, subagents: Subagent[]) => void;
  upsertSubagent: (subagent: Subagent) => void;
  editSubagent: (id: string, edit: (subagent: Subagent) => Subagent) => void;
  removeSubagent: (id: string) => void;
  /** The provider takes no message for a subagent; it goes to the main agent, naming the subagent. */
  messageSubagent: (id: string, text: string) => Promise<void>;
}

export const createSubagentSlice: SliceCreator<SubagentSlice> = (set, get) => ({
  subagents: {},

  replaceSubagents: (parentId, subagents) =>
    set((s) => ({
      subagents: {
        ...Object.fromEntries(
          Object.entries(s.subagents).filter(([, sub]) => sub.parentId !== parentId),
        ),
        ...Object.fromEntries(subagents.map((sub) => [sub.id, sub])),
      },
    })),

  upsertSubagent: (subagent) =>
    set((s) => ({ subagents: { ...s.subagents, [subagent.id]: subagent } })),

  editSubagent: (id, edit) =>
    set((s) => {
      const sub = s.subagents[id];
      return sub ? { subagents: { ...s.subagents, [id]: edit(sub) } } : s;
    }),

  removeSubagent: (id) =>
    set((s) => ({
      subagents: Object.fromEntries(Object.entries(s.subagents).filter(([key]) => key !== id)),
    })),

  messageSubagent: async (id, text) => {
    const sub = get().subagents[id];
    if (sub) await get().sendMessage(sub.parentId, aboutSubagent(sub.name, text), []);
  },
});
