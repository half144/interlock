import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { monoText } from "@/lib/styles";
import { useTaskActions } from "./useTaskActions";

interface TaskActionsProps {
  agent: Agent;
  /** The pull request button, shown once the work is ready to ship. */
  ship: ReactNode;
  menu: ReactNode;
}

export function TaskActions({ agent, ship, menu }: TaskActionsProps) {
  const { diffOpen, toggleDiff, canShip } = useTaskActions(agent);

  return (
    <div className="relative flex items-center gap-0.5">
      {/* The PR action appears the moment the work is ready, so it arrives instead of just being there. */}
      <AnimatePresence initial={false} mode="popLayout">
        {canShip && (
          <motion.span
            key="ship"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: fadeIn }}
            exit={{ opacity: 0, scale: 0.95, transition: fadeOut }}
          >
            {ship}
          </motion.span>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={toggleDiff}
        aria-pressed={diffOpen}
        aria-label={`Changes: ${agent.additions} added, ${agent.deletions} removed`}
        className={cn(
          monoText,
          "mx-1 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 tabular-nums transition-[background-color,border-color,scale] duration-150 ease-out-quint active:scale-[0.97]",
          diffOpen ? "border-seam-2 bg-selected" : "border-seam hover:bg-hover",
        )}
      >
        <DiffStat additions={agent.additions} deletions={agent.deletions} />
      </button>
      {menu}
    </div>
  );
}
