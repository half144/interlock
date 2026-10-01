import { useStore } from "@/stores/app-store";

/** A thread and the agent leading it, the one its header, transcript and workspace follow. */
export function useThread(threadId: string) {
  const thread = useStore((s) => s.threads[threadId]);
  const agentId = thread?.agentIds[0];
  const agent = useStore((s) => (agentId ? s.agents[agentId] : undefined));
  return { thread, agent };
}
