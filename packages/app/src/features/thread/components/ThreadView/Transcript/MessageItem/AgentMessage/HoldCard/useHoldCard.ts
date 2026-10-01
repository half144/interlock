import { useStore } from "@/stores/app-store";

export function useHoldCard(agentId: string) {
  const hold = useStore((s) => s.agents[agentId]?.hold);
  return { hold };
}
