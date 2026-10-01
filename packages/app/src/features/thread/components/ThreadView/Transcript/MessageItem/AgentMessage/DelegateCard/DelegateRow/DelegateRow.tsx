import { ArrowUpRight } from "lucide-react";
import type { Agent, Subagent } from "@/types";
import { cn } from "@/lib/utils";
import { doing } from "@/lib/tools";
import { duration, elapsedOf } from "@/lib/clock";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";
import { SwapText } from "@/components/ui/SwapText/SwapText";

interface DelegateRowProps {
  sub: Subagent;
  agent: Agent;
  selected: boolean;
  onOpen: () => void;
}

export function DelegateRow({ sub, agent, selected, onOpen }: DelegateRowProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={selected}
      className={cn(
        "group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        selected ? "bg-selected" : "hover:bg-hover",
      )}
    >
      <RoleTile />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-ink">{sub.name}</span>
        <SwapText
          className={cn("text-[13px]", sub.status === "running" ? "shimmer" : "text-ink-3")}
          text={sub.status === "running" ? doing(sub) : sub.brief}
        />
      </span>
      <SubStatus status={sub.status} />
      <span className="w-14 text-right font-mono text-[12px] tabular-nums text-ink-3">
        {sub.status === "queued" ? "—" : duration(elapsedOf(sub, agent))}
      </span>
      <ArrowUpRight className="size-4 text-ink-4 opacity-0 transition-[opacity,translate] duration-150 ease-out-quint group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </button>
  );
}
