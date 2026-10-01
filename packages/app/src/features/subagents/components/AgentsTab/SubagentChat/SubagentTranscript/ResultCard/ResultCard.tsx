import { CornerDownLeft } from "lucide-react";
import type { Agent, Subagent } from "@/types";
import { statusLine } from "@/features/subagents/utils/stats";

/** What the subagent handed back to its parent, with what the run took. */
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
      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 border-t border-seam pt-3 text-[12.5px] text-ink-3 tabular-nums">
        {statusLine(sub, agent)}
        {sub.subtitle && <span className="text-ink-4"> · {sub.subtitle}</span>}
      </p>
    </>
  );
}
