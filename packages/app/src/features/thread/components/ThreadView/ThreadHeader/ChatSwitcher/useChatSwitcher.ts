import { useStore } from "@/stores/app-store";
import type { Aspect, Thread } from "@/types";

const ACTIVE: Aspect[] = ["running", "held", "review"];

export function useChatSwitcher(threadId: string) {
  const threads = useStore((s) => s.threads);
  const agents = useStore((s) => s.agents);
  const openThread = useStore((s) => s.openThread);
  const current = threads[threadId];
  const aspectOf = (t: Thread) => agents[t.agentIds[0] ?? ""]?.aspect;
  const active = Object.values(threads).flatMap((t) => {
    const aspect = aspectOf(t);
    return aspect && ACTIVE.includes(aspect) ? [{ thread: t, aspect }] : [];
  });

  return {
    current,
    currentAspect: current && aspectOf(current),
    active,
    open: (id: string) => {
      if (id !== threadId) openThread(id);
    },
  };
}
