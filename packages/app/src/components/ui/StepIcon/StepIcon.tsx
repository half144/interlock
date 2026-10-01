import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import type { PlanStatus } from "@/types";
import { fadeIn, fadeOut, spring } from "@/lib/motion";

const marks: Record<PlanStatus, ReactNode> = {
  completed: (
    <span className="flex size-4 items-center justify-center rounded-full bg-ink-3">
      <Check className="size-2.5 text-panel" strokeWidth={3.5} />
    </span>
  ),
  in_progress: <LoaderCircle className="size-4 animate-spin-slow text-run" />,
  pending: <span className="size-4 rounded-full border-[1.5px] border-ink-4" />,
};

/**
 * A step's status mark. When a step finishes, the spinner gives way to a check that lands with a short
 * scale-in; marks that were already there when the screen opened don't replay it.
 */
export function StepIcon({ status }: { status: PlanStatus }) {
  return (
    <span className="grid size-4 shrink-0">
      <AnimatePresence initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: status === "completed" ? 0.6 : 0.85 }}
          animate={{ opacity: 1, scale: 1, transition: { scale: spring, opacity: fadeIn } }}
          exit={{ opacity: 0, scale: 0.8, transition: fadeOut }}
          className="grid place-items-center [grid-area:1/1]"
        >
          {marks[status]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
