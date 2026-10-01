import { agents as seedAgents } from "@/mocks/agents";
import { logs as seedLogs } from "@/mocks/logs";
import { threads as seedThreads } from "@/mocks/threads";
import { byId } from "@/lib/utils";
import type { Agent, Effort, LogLine, Thread } from "@/types";
import { newAgent, newThread, nextAgentId } from "../factories";
import { appendMessages, nextMessageId, patchAgent } from "../helpers";
import type { AppState, NewTask, SliceCreator } from "../types";

export interface TaskSlice {
  agents: Record<string, Agent>;
  threads: Record<string, Thread>;
  logs: Record<string, LogLine[]>;

  startTask: (task: NewTask) => void;
  resolveHold: (agentId: string, answer: string) => void;
  setEffort: (agentId: string, effort: Effort) => void;
  sendMessage: (threadId: string, text: string) => void;
  merge: (agentId: string) => void;
  discard: (agentId: string) => void;
}

function held(s: AppState, agentId: string, answer: string): Partial<AppState> {
  const agent = s.agents[agentId];
  const thread = agent && s.threads[agent.threadId];
  if (!agent || !thread) return s;
  return {
    agents: {
      ...s.agents,
      [agentId]: {
        ...agent,
        aspect: "running",
        hold: undefined,
        step: "Continuing",
        mode: "auto",
      },
    },
    threads: {
      ...s.threads,
      [agent.threadId]: appendMessages(
        thread,
        { id: nextMessageId(), role: "user", minAgo: 0, text: answer },
        {
          id: nextMessageId(),
          role: "agent",
          agentId,
          minAgo: 0,
          blocks: [{ type: "text", text: `Got it, going with “${answer}”.` }],
        },
      ),
    },
  };
}

function sent(s: AppState, threadId: string, text: string): Partial<AppState> {
  const thread = s.threads[threadId];
  if (!thread) return s;
  const agentId = thread.agentIds[0];
  const agent = agentId ? s.agents[agentId] : undefined;
  return {
    threads: {
      ...s.threads,
      [threadId]: appendMessages(
        thread,
        { id: nextMessageId(), role: "user", minAgo: 0, text },
        {
          id: nextMessageId(),
          role: "agent",
          agentId,
          minAgo: 0,
          blocks: [{ type: "text", text: "Understood. I’ll fold that in and keep going." }],
        },
      ),
    },
    agents:
      agentId && agent?.aspect !== "merged"
        ? patchAgent(s.agents, agentId, { aspect: "running", hold: undefined })
        : s.agents,
  };
}

function discarded(s: AppState, agentId: string): Partial<AppState> {
  const subs = { ...s.subagents };
  for (const sub of Object.values(subs)) {
    if (sub.parentId === agentId && (sub.status === "running" || sub.status === "queued"))
      subs[sub.id] = { ...sub, status: "stopped", result: "Stopped with the task." };
  }
  return {
    subagents: subs,
    agents: patchAgent(s.agents, agentId, {
      aspect: "discarded",
      step: "Discarded",
      hold: undefined,
    }),
  };
}

export const createTaskSlice: SliceCreator<TaskSlice> = (set, get) => ({
  agents: byId(seedAgents),
  threads: byId(seedThreads),
  logs: seedLogs,

  startTask: (task) => {
    const id = nextAgentId(task.projectId, get().agents);
    const threadId = `t-${id.toLowerCase()}`;
    const title = (task.prompt.split(/[.\n]/)[0] ?? "").slice(0, 64) || "Untitled task";
    const agent = newAgent(id, threadId, title, task);
    const thread = newThread(threadId, id, title, task);
    set((s) => ({
      agents: { ...s.agents, [id]: agent },
      threads: { ...s.threads, [threadId]: thread },
      logs: {
        ...s.logs,
        [id]: [{ kind: "dim", text: `interlock · creating worktree ${agent.branch}` }],
      },
      view: { kind: "thread", threadId },
      selectedAgentId: id,
      panelOpen: false,
    }));
  },

  resolveHold: (agentId, answer) => set((s) => held(s, agentId, answer)),

  setEffort: (agentId, effort) =>
    set((s) => ({ agents: patchAgent(s.agents, agentId, { effort }) })),

  sendMessage: (threadId, text) => set((s) => sent(s, threadId, text)),

  merge: (agentId) =>
    set((s) => ({
      agents: patchAgent(s.agents, agentId, {
        aspect: "merged",
        step: "Merged into main",
        pr: s.agents[agentId]?.pr ?? 1851,
      }),
    })),

  discard: (agentId) => set((s) => discarded(s, agentId)),
});
