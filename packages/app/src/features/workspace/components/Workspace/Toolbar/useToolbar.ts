import { useStore } from "@/stores/app-store";
import { useSubagents } from "@/hooks/useSubagents";

export function useToolbar(agentId: string, projectId: string) {
  const panelTab = useStore((s) => s.panelTab);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const go = useStore((s) => s.go);
  const maximized = useStore((s) => s.reviewMaximized);
  const setMaximized = useStore((s) => s.setReviewMaximized);
  const subagentCount = useSubagents(agentId).length;

  return {
    panelTab,
    selectTab: setPanelTab,
    subagentCount,
    maximized,
    toggleMaximized: () => setMaximized(!maximized),
    openSettings: () => go({ kind: "settings", projectId }),
  };
}
