import { AnimatePresence, motion } from "motion/react";
import { Check, GitMerge } from "lucide-react";
import type { PlanStatus } from "@/types";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";

export type WorktreeMarkKind = "step" | "review" | "merged";

/**
 * The status mark on the worktree row. Finishing the task is the moment worth marking: the spinner gives
 * way to a green check (or the merge icon) that lands with a short scale-in.
 */
export function WorktreeMark({ kind, status }: { kind: WorktreeMarkKind; status: PlanStatus }) {
  return (
    <span className="grid size-4 shrink-0">
      <AnimatePresence initial={false}>
        <motion.span
          key={kind}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, transition: { scale: spring, opacity: fadeIn } }}
          exit={{ opacity: 0, scale: 0.8, transition: fadeOut }}
          className="grid place-items-center [grid-area:1/1]"
        >
          {kind === "step" ? <StepIcon status={status} /> : <Finished merged={kind === "merged"} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Done looks different from in progress: green when it's ready for you, purple once it's merged. */
function Finished({ merged }: { merged: boolean }) {
  if (merged) return <GitMerge className="size-4 shrink-0 text-merge" />;
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green">
      <Check className="size-2.5 text-panel" strokeWidth={3.5} />
    </span>
  );
}
