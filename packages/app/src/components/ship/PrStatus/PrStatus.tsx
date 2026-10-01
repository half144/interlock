import { usePullRequest } from "@/hooks/usePullRequest";
import type { Agent } from "@/types";
import { ChecksDot } from "@/components/ship/ChecksDot/ChecksDot";
import { PrState } from "@/components/ship/PrState/PrState";

/** One line on the task's pull request for headers and rows: its number, state and how its checks stand. */
export function PrStatus({ agent }: { agent: Agent }) {
  const pr = usePullRequest(agent);
  if (pr.phase === "none") return null;

  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-3">
      {pr.number && <span className="font-mono text-ink-2">#{pr.number}</span>}
      <PrState pr={pr} />
      {pr.phase === "open" && (
        <span className="inline-flex items-center gap-1.5">
          <ChecksDot state={pr.summary.state} />
          {pr.summary.label}
        </span>
      )}
    </span>
  );
}
