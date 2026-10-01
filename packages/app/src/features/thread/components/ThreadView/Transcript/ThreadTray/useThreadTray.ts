import { useId } from "react";
import { useStore } from "@/stores/app-store";
import { useSubagents } from "@/hooks/useSubagents";

export function useThreadTray(agentId: string) {
  const subs = useSubagents(agentId);
  const openSubagent = useStore((s) => s.openSubagent);
  const openPanel = useStore((s) => s.openPanel);
  const selected = useStore((s) =>
    s.panelOpen && s.panelTab === "agents" ? s.selectedSubagentId : undefined,
  );
  const group = useId();

  return {
    subs,
    selected,
    layoutId: `${group}-selected`,
    openSubagent,
    openDiff: () => openPanel("diff"),
  };
}
