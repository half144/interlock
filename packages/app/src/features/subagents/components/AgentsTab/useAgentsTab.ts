import { useStore } from "@/stores/app-store";
import { useSubagents } from "@/hooks/useSubagents";

export function useAgentsTab(agentId: string) {
  const agent = useStore((s) => s.agents[agentId]);
  const selected = useStore((s) => s.selectedSubagentId);
  const open = useStore((s) => s.openSubagent);
  const subs = useSubagents(agentId);

  return { agent, subs, current: subs.find((s) => s.id === selected), open };
}
