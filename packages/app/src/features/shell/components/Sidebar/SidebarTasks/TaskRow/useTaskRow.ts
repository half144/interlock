import type { Thread } from "@/types";
import { useStore } from "@/stores/app-store";

export function useTaskRow(thread: Thread) {
  const openThread = useStore((s) => s.openThread);
  const agent = useStore((s) => (thread.agentIds[0] ? s.agents[thread.agentIds[0]] : undefined));
  return { agent, open: () => openThread(thread.id) };
}
