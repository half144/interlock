import { useStore } from "@/stores/app-store";
import type { Subagent } from "@/types";

export function useSubagents(agentId: string): Subagent[] {
  const all = useStore((s) => s.subagents);
  return Object.values(all).filter((s) => s.parentId === agentId);
}
