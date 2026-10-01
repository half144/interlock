import { useStore } from "@/stores/app-store";
import type { Hold } from "@/types";

const DENY = "Deny";

export function useApprovalHold(agentId: string, hold: Hold) {
  const resolveHold = useStore((s) => s.resolveHold);
  const [primary, ...others] = (hold.options ?? []).filter((option) => option !== DENY);

  return {
    primary,
    others,
    answer: (option: string) => void resolveHold(agentId, option),
    deny: () => void resolveHold(agentId, DENY),
  };
}
