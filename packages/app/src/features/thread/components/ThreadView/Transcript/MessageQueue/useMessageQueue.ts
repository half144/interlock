import { useStore } from "@/stores/app-store";
import type { QueuedMessage } from "@/stores/slices/queue";

const NONE: QueuedMessage[] = [];

export function useMessageQueue(threadId: string) {
  const items = useStore((s) => s.queues[threadId] ?? NONE);
  const paused = useStore((s) => s.paused[threadId] === true);
  const unqueue = useStore((s) => s.unqueue);
  const sendQueued = useStore((s) => s.sendQueued);

  return {
    items,
    paused,
    remove: (id: string) => unqueue(threadId, id),
    sendNow: (id: string) => void sendQueued(threadId, id),
  };
}
