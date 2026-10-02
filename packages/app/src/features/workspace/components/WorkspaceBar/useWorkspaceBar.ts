import { useBarSlot } from "@/components/layout/WindowBar/barSlot";
import { useStore } from "@/stores/app-store";

export function useWorkspaceBar(agentId: string) {
  return { agent: useStore((s) => s.agents[agentId]), inBar: useBarSlot() !== null };
}
