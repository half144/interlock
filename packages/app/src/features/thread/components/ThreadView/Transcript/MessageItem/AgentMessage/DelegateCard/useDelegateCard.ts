import { useState } from "react";
import { useStore } from "@/stores/app-store";

export function useDelegateCard(agentId: string, toolCallIds: string[]) {
  const agent = useStore((s) => s.agents[agentId]);
  const all = useStore((s) => s.subagents);
  const openSubagent = useStore((s) => s.openSubagent);
  const openChat = useStore((s) =>
    s.panelOpen && s.panelTab === "agents" ? s.selectedSubagentId : null,
  );
  const [open, setOpen] = useState(true);
  const subs = Object.values(all).filter(
    (s) => s.parentId === agentId && s.toolCallId !== null && toolCallIds.includes(s.toolCallId),
  );

  return {
    agent,
    subs,
    done: subs.filter((s) => s.status === "done").length,
    working: subs.find((s) => s.status === "running"),
    openChat,
    openSubagent,
    open,
    toggle: () => setOpen((o) => !o),
  };
}
