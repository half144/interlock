import type { Access, Agent, Effort, Message, Thread } from "@/types";
import { taskActions } from "../taskActions";
import { mergeAgent } from "../threads";
import { turnEnded } from "./queue";
import type { PlanChoice } from "@/daemon/adapters/holds";
import type { NewTask, SliceCreator } from "../types";

export interface TaskSlice {
  agents: Record<string, Agent>;
  /** One thread per agent, under the agent's id. */
  threads: Record<string, Thread>;

  replaceAgents: (agents: Agent[]) => void;
  upsertAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  editMessages: (agentId: string, edit: (messages: Message[]) => Message[]) => void;

  startTask: (task: NewTask) => Promise<void>;
  sendMessage: (threadId: string, text: string, files: File[]) => Promise<void>;
  interrupt: (agentId: string) => Promise<void>;
  resolveHold: (agentId: string, option: string) => Promise<void>;
  /** Answers every question of a question hold at once, by question header. */
  resolveQuestions: (agentId: string, answers: Record<string, string>) => Promise<void>;
  /** The conversation plans before it edits, from the next message on. */
  startPlanning: (agentId: string) => Promise<void>;
  resolvePlan: (agentId: string, choice: PlanChoice) => Promise<void>;
  /** Moves the conversation to another autonomy level, from its next permission request on. */
  setAccess: (agentId: string, access: Access) => Promise<void>;
  setEffort: (agentId: string, effort: Effort) => Promise<void>;
  setModel: (agentId: string, modelId: string) => Promise<void>;
  /** Removes the task: its worktree and branch when it has one, then the agent itself. Leaves the thread if it is open. */
  deleteTask: (agentId: string) => Promise<void>;
}

const keyed = <T extends { id: string }>(list: T[]) =>
  Object.fromEntries(list.map((x) => [x.id, x]));

export const createTaskSlice: SliceCreator<TaskSlice> = (set, get) => ({
  agents: {},
  threads: {},

  replaceAgents: (agents) => {
    const { agents: prev, threads } = get();
    const merged = agents.map((a) => mergeAgent(prev[a.id], a, threads[a.id]));
    set({
      agents: keyed(merged.map((m) => m.agent)),
      threads: keyed(merged.map((m) => m.thread)),
    });
    for (const { agent } of merged) {
      if (turnEnded(prev[agent.id], agent)) void get().flushQueue(agent.id);
    }
  },

  upsertAgent: (agent) => {
    const previous = get().agents[agent.id];
    set((s) => {
      const { agent: next, thread } = mergeAgent(s.agents[agent.id], agent, s.threads[agent.id]);
      return {
        agents: { ...s.agents, [agent.id]: next },
        threads: { ...s.threads, [agent.id]: thread },
      };
    });
    if (turnEnded(previous, agent)) void get().flushQueue(agent.id);
  },

  removeAgent: (agentId) =>
    set((s) => ({
      agents: Object.fromEntries(Object.entries(s.agents).filter(([id]) => id !== agentId)),
      threads: Object.fromEntries(Object.entries(s.threads).filter(([id]) => id !== agentId)),
    })),

  editMessages: (agentId, edit) =>
    set((s) => {
      const thread = s.threads[agentId];
      return thread
        ? { threads: { ...s.threads, [agentId]: { ...thread, messages: edit(thread.messages) } } }
        : s;
    }),

  ...taskActions(set, get),
});
