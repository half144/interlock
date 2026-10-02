import { useStore } from "@/stores/app-store";
import { useSidebarWidth } from "@/hooks/useRail";
import { barInset } from "@/lib/layout";
import { useSubagents } from "@/hooks/useSubagents";

export function useToolbar(agentId: string, projectId: string) {
  const panelTab = useStore((s) => s.panelTab);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const go = useStore((s) => s.go);
  const maximized = useStore((s) => s.reviewMaximized);
  const setMaximized = useStore((s) => s.setReviewMaximized);
  const sidebarWidth = useSidebarWidth();
  const subagentCount = useSubagents(agentId).length;

  return {
    panelTab,
    selectTab: setPanelTab,
    subagentCount,
    maximized,
    /** Flush left under the window buttons, the tabs start after them. */
    inset: maximized ? barInset(sidebarWidth) : 0,
    toggleMaximized: () => setMaximized(!maximized),
    openSettings: () => go({ kind: "settings", projectId }),
  };
}
