import type { Agent, Subagent } from "@/types";
import { cn } from "@/lib/utils";
import { doing, toolUses } from "@/lib/tools";
import { duration, elapsedOf } from "@/lib/clock";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";
import { TreeSelection } from "@/features/subagents/components/tree/TreeSelection/TreeSelection";

/** A subagent in the tree: status, name, and what it's doing now or how much it did. */
export function SubagentRow({
  sub,
  agent,
  selected,
  onSelect,
}: {
  sub: Subagent;
  agent: Agent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="relative">
      <span aria-hidden className="absolute top-[19px] -left-2 h-px w-2 bg-seam" />
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected}
        className={cn(
          "relative isolate flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
          !selected && "hover:bg-hover",
        )}
      >
        {selected && <TreeSelection />}
        <span className="mt-0.5">
          <SubStatus status={sub.status} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{sub.name}</span>
            {sub.status !== "queued" && sub.status !== "running" && (
              <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
                {duration(elapsedOf(sub, agent))}
              </span>
            )}
          </span>
          <span
            className={cn(
              "block truncate text-[12px]",
              sub.status === "running" ? "shimmer" : "text-ink-3",
            )}
          >
            {sub.status === "running"
              ? doing(sub)
              : sub.status === "queued"
                ? "Starts next"
                : `${toolUses(sub)} tool uses`}
          </span>
        </span>
      </button>
    </li>
  );
}
