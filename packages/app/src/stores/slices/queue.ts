import type { Agent } from "@/types";
import type { SliceCreator } from "../types";

export interface QueuedMessage {
  id: string;
  text: string;
  files: File[];
}

export interface QueueSlice {
  /** Messages written while the agent works, per thread, oldest first. They go out one per turn. */
  queues: Record<string, QueuedMessage[]>;
  /** Threads whose agent was stopped: the queue waits for the user instead of sending on its own. */
  paused: Record<string, true>;
  enqueue: (threadId: string, text: string, files: File[]) => void;
  unqueue: (threadId: string, id: string) => void;
  /** Sends one queued message now, steering the turn if the agent is still running. */
  sendQueued: (threadId: string, id: string) => Promise<void>;
  /** Sends the next queued message after a turn ended. */
  flushQueue: (threadId: string) => Promise<void>;
}

/** A turn ended on its own: the agent went from working to idle or ready for review, not to a question or a failure. */
export const turnEnded = (previous: Agent | undefined, next: Agent) =>
  previous?.aspect === "running" && (next.aspect === "review" || next.aspect === "idle");

const without = <T>(record: Record<string, T>, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key));

export const createQueueSlice: SliceCreator<QueueSlice> = (set, get) => {
  const take = (threadId: string, id: string) => {
    const message = get().queues[threadId]?.find((m) => m.id === id);
    if (!message) return undefined;
    set((s) => {
      const rest = (s.queues[threadId] ?? []).filter((m) => m.id !== id);
      return {
        queues: rest.length > 0 ? { ...s.queues, [threadId]: rest } : without(s.queues, threadId),
      };
    });
    return message;
  };

  return {
    queues: {},
    paused: {},

    enqueue: (threadId, text, files) =>
      set((s) => ({
        queues: {
          ...s.queues,
          [threadId]: [...(s.queues[threadId] ?? []), { id: crypto.randomUUID(), text, files }],
        },
      })),

    unqueue: (threadId, id) => void take(threadId, id),

    sendQueued: async (threadId, id) => {
      const message = take(threadId, id);
      if (!message) return;
      set((s) => ({ paused: without(s.paused, threadId) }));
      await get().sendMessage(threadId, message.text, message.files);
    },

    flushQueue: async (threadId) => {
      if (get().paused[threadId]) {
        set((s) => ({ paused: without(s.paused, threadId) }));
        return;
      }
      const next = get().queues[threadId]?.[0];
      if (next) await get().sendQueued(threadId, next.id);
    },
  };
};
