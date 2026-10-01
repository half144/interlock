import { useStore } from "@/stores/app-store";
import { isFinished } from "@/lib/agentStatus";
import { usePullRequest } from "@/hooks/usePullRequest";
import type { Agent } from "@/types";

export function useTaskActions(agent: Agent) {
  const panelOpen = useStore((s) => s.panelOpen);
  const panelTab = useStore((s) => s.panelTab);
  const openPanel = useStore((s) => s.openPanel);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const pr = usePullRequest(agent);
  const diffOpen = panelOpen && panelTab === "diff";

  return {
    diffOpen,
    toggleDiff: () => {
      if (diffOpen) setPanelOpen(false);
      else openPanel("diff");
    },
    canShip: isFinished(agent) || pr.phase !== "none",
  };
}
