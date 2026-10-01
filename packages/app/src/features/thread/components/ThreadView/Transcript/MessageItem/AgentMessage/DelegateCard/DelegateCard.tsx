import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { SubagentStatus } from "@/types";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { doing } from "@/lib/tools";
import { duration, elapsedOf } from "@/lib/clock";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";
import { surface } from "@/lib/styles";

/** One segment per subagent in the header's progress strip. */
const segment: Record<SubagentStatus, string> = {
  done: "bg-ink-3",
  running: "bg-run",
  stopped: "bg-ink-4",
  failed: "bg-ink-4",
  queued: "bg-selected",
};

/** The main agent handed parts of the task to subagents: who, doing what right now, and how far along. Each row opens that subagent's chat. */
export function DelegateCard({ agentId, subagentIds }: { agentId: string; subagentIds: string[] }) {
  const agent = useStore((s) => s.agents[agentId]);
  const all = useStore((s) => s.subagents);
  const openSubagent = useStore((s) => s.openSubagent);
  const openChat = useStore((s) =>
    s.panelOpen && s.panelTab === "agents" ? s.selectedSubagentId : null,
  );
  const subs = subagentIds.flatMap((id) => all[id] ?? []);
  const done = subs.filter((s) => s.status === "done").length;
  const working = subs.find((s) => s.status === "running");
  const [open, setOpen] = useState(true);

  if (!agent) return null;

  return (
    <div className={cn(surface.card, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex -space-x-2">
          {subs.map((s) => (
            <RoleTile key={s.id} role={s.role} size="sm" />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-ink">
            Delegated to {subs.length} subagents
          </span>
          <SwapText
            className={cn("text-[12.5px]", working ? "shimmer" : "text-ink-3")}
            text={
              working
                ? `${working.name} is working · ${done} of ${subs.length} done`
                : done === subs.length
                  ? "All done · results merged into the plan"
                  : `${done} of ${subs.length} done`
            }
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
              <button
                type="button"
                onClick={() => openSubagent(s.id)}
                aria-current={openChat === s.id}
                className={cn(
                  "group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  openChat === s.id ? "bg-selected" : "hover:bg-hover",
                )}
              >
                <RoleTile role={s.role} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-ink">{s.name}</span>
                  <SwapText
                    className={cn("text-[13px]", s.status === "running" ? "shimmer" : "text-ink-3")}
                    text={s.status === "running" ? doing(s) : s.brief}
                  />
                </span>
                <SubStatus status={s.status} />
                <span className="w-14 text-right font-mono text-[12px] tabular-nums text-ink-3">
                  {s.status === "queued" ? "—" : duration(elapsedOf(s, agent))}
                </span>
                <ArrowUpRight className="size-4 text-ink-4 opacity-0 transition-[opacity,translate] duration-150 ease-out-quint group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}
