import { hasResumeAction } from "@/daemon/adapters/holds";
import { modeFor } from "@/daemon/adapters/modes";
import { useStore } from "@/stores/app-store";
import type { Hold } from "@/types";
import { focusComposer } from "@/features/thread/utils/focusComposer";

export function usePlanHold(agentId: string, hold: Hold) {
  const resolvePlan = useStore((s) => s.resolvePlan);
  const agent = useStore((s) => s.agents[agentId]);
  const fullAuto = agent ? modeFor(agent.kind, "auto", "full-auto") : null;
  const fullAutoOffered =
    hasResumeAction(hold) || (fullAuto !== null && agent?.modeId !== fullAuto);

  return {
    fullAutoOffered,
    approve: () => void resolvePlan(agentId, "approve"),
    reject: () => void resolvePlan(agentId, "reject"),
    approveFullAuto: () => void resolvePlan(agentId, "full-auto"),
    suggest: () => focusComposer("Change the plan: "),
  };
}
