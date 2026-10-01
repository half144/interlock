import { taskClock } from "@/lib/clock";
import { completions, streamPool, subagentStream } from "@/mocks/simulation";
import type { Agent, LogLine, Subagent, SubagentEvent } from "@/types";
import { nextToastId } from "./helpers";
import { startNextQueued } from "./slices/subagents";
import type { SliceCreator, Toast } from "./types";

/*
 * The only place agents move on their own. Everything here stands in for what a real provider would
 * report (progress, tool calls, logs, completions); the slices only hold state and react to the user.
 * A real integration replaces this tick with provider events that write through the same state shape.
 */

export interface SimulationSlice {
  tick: () => void;
}

/** Subagents only make progress while their parent task is still live. */
const LIVE = new Set(["running", "held"]);

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function stepAgent(agent: Agent, blocked: boolean, selected: boolean): Agent {
  const progress = Math.min(blocked ? 0.94 : 1, agent.progress + 0.004 + Math.random() * 0.01);
  const done = progress >= 1;
  return {
    ...agent,
    progress,
    aspect: done ? "review" : "running",
    step: done ? "Ready for review" : agent.step,
    tokens: agent.tokens + Math.round(1500 + Math.random() * 4000),
    cost: +(agent.cost + 0.01 + Math.random() * 0.03).toFixed(2),
    additions: agent.additions + (Math.random() < 0.3 ? Math.ceil(Math.random() * 6) : 0),
    unseen: selected ? 0 : agent.unseen + (Math.random() < 0.12 ? 1 : 0),
  };
}

/** Running tasks inch forward; a task can't be ready for review while its subagents are still out. */
function advanceAgents(
  agents: Record<string, Agent>,
  logs: Record<string, LogLine[]>,
  subagents: Record<string, Subagent>,
  selectedAgentId: string | null,
) {
  const nextAgents = { ...agents };
  const nextLogs = { ...logs };
  const ready: Agent[] = [];
  const waiting = new Set(
    Object.values(subagents)
      .filter((s) => s.status === "running" || s.status === "queued")
      .map((s) => s.parentId),
  );

  for (const agent of Object.values(agents)) {
    if (agent.aspect !== "running") continue;
    const nextAgent = stepAgent(agent, waiting.has(agent.id), agent.id === selectedAgentId);
    const done = nextAgent.aspect === "review";
    nextAgents[agent.id] = nextAgent;
    const line = pick(streamPool);
    if (line && Math.random() < 0.45)
      nextLogs[agent.id] = [...(nextLogs[agent.id] ?? []), line].slice(-400);
    if (done) ready.push(nextAgent);
  }
  return { agents: nextAgents, logs: nextLogs, ready };
}

function stepSubagent(sub: Subagent, now: number): Subagent {
  const progress = Math.min(1, sub.progress + 0.01 + Math.random() * 0.02);
  const call = pick(subagentStream);
  const fresh = call && !sub.events.some((e) => e.kind === call.kind && e.text === call.text);
  const event: SubagentEvent[] =
    call && fresh && Math.random() < 0.25 ? [{ ...call, sec: now }] : [];
  const done = progress >= 1;
  return {
    ...sub,
    progress,
    status: done ? "done" : "running",
    endSec: done ? now : undefined,
    tokens: sub.tokens + Math.round(800 + Math.random() * 1600),
    cost: +(sub.cost + 0.005 + Math.random() * 0.01).toFixed(2),
    events: [...sub.events, ...event],
    ...(done
      ? (completions[sub.id] ?? {
          result: "Followed up on your note. Everything I reported above still holds.",
          findings: [],
          usedIn: undefined,
        })
      : {}),
  };
}

/** Running subagents move forward and log what they do; when one finishes, the next queued one in its task starts. */
function advanceSubagents(subs: Record<string, Subagent>, agents: Record<string, Agent>) {
  const next = { ...subs };
  const finished: Subagent[] = [];
  for (const sub of Object.values(subs)) {
    const parent = agents[sub.parentId];
    if (sub.status !== "running" || !parent || !LIVE.has(parent.aspect)) continue;
    const now = taskClock(parent);
    const nextSub = stepSubagent(sub, now);
    const done = nextSub.status === "done";
    next[sub.id] = nextSub;
    if (done) {
      finished.push(nextSub);
      startNextQueued(next, sub.parentId, now);
    }
  }
  return { subs: next, finished };
}

export const createSimulationSlice: SliceCreator<SimulationSlice> = (set, get) => ({
  tick: () => {
    const { agents, logs, selectedAgentId, subagents } = get();
    const moved = advanceAgents(agents, logs, subagents, selectedAgentId);
    const { subs, finished } = advanceSubagents(subagents, moved.agents);
    const toasts: Toast[] = [
      ...moved.ready.map((agent) => ({
        id: nextToastId(),
        agentId: agent.id,
        text: "Ready for review",
      })),
      ...finished.map((sub) => ({
        id: nextToastId(),
        agentId: sub.parentId,
        subagentId: sub.id,
        text: `${sub.name} finished`,
      })),
    ];
    set((s) => ({
      agents: moved.agents,
      logs: moved.logs,
      subagents: subs,
      toasts: [...s.toasts, ...toasts].slice(-4),
    }));
  },
});
