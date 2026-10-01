import { AnimatePresence, motion } from "motion/react";
import type { Agent, Thread } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { CardLine } from "./CardLine/CardLine";
import { StepCounter } from "./StepCounter/StepCounter";
import { StepList } from "./StepList/StepList";
import { useWorktreeCard } from "./useWorktreeCard";
import { WorktreeMark } from "./WorktreeMark/WorktreeMark";
import { WorktreeScreen } from "./WorktreeScreen/WorktreeScreen";

const swap = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: fadeIn },
  exit: { opacity: 0, transition: fadeOut },
};

// The strip rises out from behind the composer: it grows from nothing while its tuck under the composer
// deepens, so the composer never jumps. Its content overflows downward meanwhile, hidden by the composer.
const rise = {
  initial: { height: 0, marginBottom: 0, opacity: 0 },
  animate: {
    height: "auto",
    marginBottom: -16,
    opacity: 1,
    transition: { default: spring, opacity: fadeIn },
  },
  exit: {
    height: 0,
    marginBottom: 0,
    opacity: 0,
    transition: { default: spring, opacity: fadeOut },
  },
};

/**
 * The agent's plan, tucked behind the top of the composer while a turn has one. It stays one line, the step
 * the agent is on and how far along the plan it is, with a little screen poking out to open the worktree.
 * Once the work is done it settles into a quieter single line. The full plan only shows when you ask for it.
 */
export function WorktreeCard({ agent, thread }: { agent: Agent; thread: Thread }) {
  const card = useWorktreeCard(agent, thread);
  const { steps, statuses, index, expanded } = card;

  return (
    <motion.div {...rise}>
      <div className="relative mx-2 rounded-t-2xl border border-b-0 border-seam bg-inset pb-4">
        <WorktreeScreen
          label={`Open ${agentLabel(agent)}’s worktree`}
          finished={card.finished}
          onOpen={card.openWorktree}
        />

        <Collapse open={expanded}>
          <div className="min-h-[34px] pt-2 pr-3.5 pl-[88px]">
            <p className="truncate text-[13.5px] font-medium text-ink">
              {agentLabel(agent)}’s worktree
            </p>
            <p
              className={cn(
                "truncate text-[12px]",
                card.statusTone === "shimmer" ? "shimmer" : "text-ink-3",
              )}
            >
              {card.statusText}
            </p>
          </div>
          <StepList steps={steps} statuses={statuses} />
        </Collapse>

        {/* The row grows to hold a status line and settles back without it, rather than snapping. */}
        <motion.button
          type="button"
          onClick={card.toggle}
          aria-expanded={expanded}
          initial={false}
          animate={{ height: card.rowHeight }}
          transition={spring}
          className="flex w-full items-center gap-2.5 pr-3.5 text-left"
        >
          <span className="grid h-full min-w-0 flex-1">
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.span
                  key="hide"
                  {...swap}
                  className="flex items-center pl-4 text-[13.5px] text-ink [grid-area:1/1]"
                >
                  Hide progress
                </motion.span>
              ) : (
                <motion.span
                  key="line"
                  {...swap}
                  className="flex min-w-0 items-center gap-2.5 pl-[88px] [grid-area:1/1]"
                >
                  <WorktreeMark kind={card.mark} status={statuses[index] ?? "pending"} />
                  <CardLine headline={card.headline} status={card.live} finished={card.finished} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <StepCounter text={card.counter} expanded={expanded} />
        </motion.button>
      </div>
    </motion.div>
  );
}
