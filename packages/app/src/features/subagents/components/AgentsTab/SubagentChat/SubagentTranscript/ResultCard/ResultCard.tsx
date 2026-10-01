import { CornerDownLeft } from "lucide-react";
import type { Agent, Subagent } from "@/types";
import { runStats } from "@/features/subagents/utils/stats";
import { Findings } from "@/features/subagents/components/chat/Findings/Findings";

/** What the subagent handed back to its parent, with what the run cost. */
export function ResultCard({
  sub,
  agent,
  parent,
}: {
  sub: Subagent;
  agent: Agent;
  parent: string;
}) {
  return (
    <>
      <p className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        <CornerDownLeft className="size-3.5" />
        Returned to {parent}
      </p>
      <p className="mt-1.5 text-[15px] leading-[1.6] text-ink [text-wrap:pretty]">{sub.result}</p>
      {sub.findings && sub.findings.length > 0 && <Findings items={sub.findings} />}
      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 border-t border-seam pt-3 text-[12.5px] text-ink-3 tabular-nums">
        {sub.status === "stopped" ? "Stopped" : "Done"} · {runStats(sub, agent)}
        {sub.usedIn && <span className="text-ink-2">· used in “{sub.usedIn}”</span>}
      </p>
    </>
  );
}
