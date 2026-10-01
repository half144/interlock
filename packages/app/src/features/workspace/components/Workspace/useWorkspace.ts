import { useStore } from "@/stores/app-store";
import { shownTab } from "@/features/workspace/utils/panelTabs";
import { useDeferredMount } from "@/features/workspace/hooks/useDeferredMount";

export function useWorkspace(agentId: string) {
  const agent = useStore((s) => s.agents[agentId]);
  const requestedTab = useStore((s) => s.panelTab);
  const maximized = useStore((s) => s.reviewMaximized);
  // The tab can be a thousand-node diff; the slide-in never waits on it.
  const ready = useDeferredMount();

  const panelTab = shownTab(requestedTab, agent?.git ?? true);

  return { agent, panelTab, maximized, ready };
}
