import { subagents as seedSubagents } from "@/mocks/subagents";
import { taskClock } from "@/lib/clock";
import { byId } from "@/lib/utils";
import type { Agent, Subagent } from "@/types";
import { appendMessages, nextMessageId } from "../helpers";
import type { AppState, SliceCreator } from "../types";

export interface SubagentSlice {
  subagents: Record<string, Subagent>;

  messageSubagent: (id: string, text: string, alsoParent: boolean) => void;
  stopSubagent: (id: string) => void;
  rerunSubagent: (id: string) => void;
}

/** Starts the next queued subagent of a task, if any. Subagents of one task take turns so they never edit the same files at once. */
export function startNextQueued(subs: Record<string, Subagent>, parentId: string, now: number) {
  const queued = Object.values(subs).find((q) => q.parentId === parentId && q.status === "queued");
  if (queued) subs[queued.id] = { ...queued, status: "running", startSec: now, progress: 0.02 };
}

function replyTo(sub: Subagent, closed: boolean) {
  if (closed)
    return "This task is closed, so I can answer from what I found but can’t change anything.";
  if (sub.status === "queued") return "Added to my brief. I’ll start with it.";
  if (sub.status === "running") return "Got it. I’ll fold that in before I report back.";
  return "On it. Picking up where I left off.";
}

/** A parent in review goes back to running while one of its subagents works again. */
const reopened = (parent: Agent, step: string): Agent =>
  parent.aspect === "review" ? { ...parent, aspect: "running", progress: 0.9, step } : parent;

function messaged(s: AppState, id: string, text: string, alsoParent: boolean): Partial<AppState> {
  const sub = s.subagents[id];
  const parent = sub && s.agents[sub.parentId];
  const thread = parent && s.threads[parent.threadId];
  if (!sub || !parent || !thread) return s;
  const now = taskClock(parent);
  const closed = parent.aspect === "merged" || parent.aspect === "discarded";
  const resume =
    !closed && (sub.status === "done" || sub.status === "stopped" || sub.status === "failed");
  // A finished subagent picks up where it left off, so its earlier answer stays in the chat above the new turn.
  const earlier =
    resume && sub.result
      ? [{ kind: "note" as const, text: sub.result, body: sub.findings, sec: sub.endSec ?? now }]
      : [];
  const events = [
    ...sub.events,
    ...earlier,
    { kind: "you" as const, text, sec: now },
    { kind: "note" as const, text: replyTo(sub, closed), sec: now },
  ];
  const next: Subagent = resume
    ? {
        ...sub,
        events,
        status: "running",
        progress: 0.7,
        idleSec: (sub.idleSec ?? 0) + now - (sub.endSec ?? now),
        endSec: undefined,
        result: undefined,
        findings: undefined,
        usedIn: undefined,
      }
    : { ...sub, events };
  const reopen = resume ? reopened(parent, `Waiting on ${sub.name.toLowerCase()}`) : parent;
  return {
    subagents: { ...s.subagents, [id]: next },
    agents: { ...s.agents, [parent.id]: reopen },
    threads: alsoParent
      ? {
          ...s.threads,
          [parent.threadId]: appendMessages(thread, {
            id: nextMessageId(),
            role: "user",
            minAgo: 0,
            text: `To ${sub.name}: ${text}`,
          }),
        }
      : s.threads,
  };
}

function stopped(s: AppState, id: string): Partial<AppState> {
  const sub = s.subagents[id];
  const parent = sub && s.agents[sub.parentId];
  if (!sub || !parent) return s;
  const now = taskClock(parent);
  const subs: Record<string, Subagent> = {
    ...s.subagents,
    [id]: {
      ...sub,
      status: "stopped",
      endSec: now,
      result: "Stopped by you before it finished.",
      findings: [],
      usedIn: undefined,
    },
  };
  startNextQueued(subs, sub.parentId, now);
  return { subagents: subs };
}

function rerun(s: AppState, id: string): Partial<AppState> {
  const sub = s.subagents[id];
  const parent = sub && s.agents[sub.parentId];
  if (!sub || !parent) return s;
  const now = taskClock(parent);
  return {
    subagents: {
      ...s.subagents,
      [id]: {
        ...sub,
        status: "running",
        progress: 0.02,
        startSec: now,
        endSec: undefined,
        idleSec: undefined,
        events: [],
        result: undefined,
        findings: undefined,
        usedIn: undefined,
      },
    },
    agents: { ...s.agents, [parent.id]: reopened(parent, `Re-running ${sub.name.toLowerCase()}`) },
  };
}

export const createSubagentSlice: SliceCreator<SubagentSlice> = (set) => ({
  subagents: byId(seedSubagents),

  messageSubagent: (id, text, alsoParent) => set((s) => messaged(s, id, text, alsoParent)),
  stopSubagent: (id) => set((s) => stopped(s, id)),
  rerunSubagent: (id) => set((s) => rerun(s, id)),
});
