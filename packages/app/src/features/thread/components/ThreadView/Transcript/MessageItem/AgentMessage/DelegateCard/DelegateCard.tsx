import { ChevronDown } from "lucide-react";
import type { SubagentStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { surface } from "@/lib/styles";
import { DelegateRow } from "./DelegateRow/DelegateRow";
import { useDelegateCard } from "./useDelegateCard";

/** One segment per subagent in the header's progress strip. */
const segment: Record<SubagentStatus, string> = {
  done: "bg-ink-3",
  running: "bg-run",
  stopped: "bg-ink-4",
  failed: "bg-ink-4",
  queued: "bg-selected",
};

function progressText(working: string | undefined, done: number, total: number) {
  if (working) return `${working} is working · ${done} of ${total} done`;
  if (done === total) return "All done · results merged into the plan";
  return `${done} of ${total} done`;
}

/** The main agent handed parts of the task to subagents: who, doing what right now, and how far along. Each row opens that subagent's chat. */
export function DelegateCard({ agentId, toolCallIds }: { agentId: string; toolCallIds: string[] }) {
  const { agent, subs, done, working, openChat, openSubagent, open, toggle } = useDelegateCard(
    agentId,
    toolCallIds,
  );
  if (!agent) return null;

  return (
    <div className={cn(surface.card, "overflow-hidden")}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex -space-x-2">
          {subs.map((s) => (
            <RoleTile key={s.id} size="sm" />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-ink">
            Delegated to {subs.length} subagents
          </span>
          <SwapText
            className={cn("text-[12.5px]", working ? "shimmer" : "text-ink-3")}
            text={progressText(working?.name, done, subs.length)}
          />
        </span>
        <span className="flex gap-0.5" aria-hidden>
          {subs.map((s) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 w-4 rounded-full transition-colors duration-300",
                segment[s.status],
              )}
            />
          ))}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-ink-3 transition-transform duration-200 ease-out-quint",
            open && "rotate-180",
          )}
        />
      </button>

      <Collapse open={open}>
        <ul className="divide-y divide-seam border-t border-seam">
          {subs.map((s) => (
            <li key={s.id}>
              <DelegateRow
                sub={s}
                agent={agent}
                selected={openChat === s.id}
                onOpen={() => openSubagent(s.id)}
              />
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}
