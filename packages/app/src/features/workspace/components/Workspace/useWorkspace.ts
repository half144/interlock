import { useStore } from "@/stores/app-store";
import { useDeferredMount } from "@/features/workspace/hooks/useDeferredMount";

export function useWorkspace(agentId: string) {
  const agent = useStore((s) => s.agents[agentId]);
  const panelTab = useStore((s) => s.panelTab);
  const maximized = useStore((s) => s.reviewMaximized);
  // The tab can be a thousand-node diff; the slide-in never waits on it.
  const ready = useDeferredMount();

  return { agent, panelTab, maximized, ready };
}
