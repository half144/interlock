import { motion } from "motion/react";
import type { Agent, Subagent } from "@/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { doing } from "@/lib/tools";
import { duration, elapsedOf } from "@/lib/clock";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";

interface SubagentChipProps {
  sub: Subagent;
  agent: Agent;
  selected: boolean;
  /** Shared by every chip in the tray, so the selection can slide between them. */
  layoutId: string;
  onOpen: () => void;
}

/** One subagent in the composer tray: its status, its name, and how long it's been running. */
export function SubagentChip({ sub, agent, selected, layoutId, onOpen }: SubagentChipProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={sub.status === "running" ? doing(sub) : sub.brief}
      aria-current={selected}
      className={cn(
        "relative inline-flex h-6 items-center rounded-full px-1.5 whitespace-nowrap transition-[color,background-color,scale] duration-150 ease-out-quint active:scale-[0.96]",
        selected ? "text-ink" : "text-ink-2 hover:bg-hover hover:text-ink",
      )}
    >
      {/* The selection slides from chip to chip, so it reads as one marker moving, not two blinking. */}
      {selected && (
        <motion.span
          layoutId={layoutId}
          transition={spring}
          className="absolute inset-0 rounded-full bg-selected"
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        <span className="flex scale-[0.8]">
          <SubStatus status={sub.status} />
        </span>
        {sub.name}
        {sub.status === "running" && (
          <span className="font-mono text-[11px] text-ink-3 tabular-nums">
            {duration(elapsedOf(sub, agent))}
          </span>
        )}
      </span>
    </button>
  );
}
