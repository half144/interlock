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

/**
 * The agent's machine, tucked behind the top of the composer. It stays one line, the step the agent is
 * on and how far along the plan it is, with a little screen poking out to open the worktree. Once the
 * work is done it settles into a quieter single line. The full plan only shows when you ask for it.
 */
export function WorktreeCard({ agent, thread }: { agent: Agent; thread: Thread }) {
  const card = useWorktreeCard(agent, thread);
  const { steps, statuses, index, current, expanded } = card;

  return (
    <div className="relative mx-2 -mb-4 rounded-t-2xl border border-b-0 border-seam bg-inset pb-4">
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

      {/* The row settles to a shorter height once the work is done, rather than snapping. */}
      <motion.button
        type="button"
        onClick={card.toggle}
        aria-expanded={steps.length > 0 ? expanded : undefined}
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
                {current && <WorktreeMark kind={card.mark} status={statuses[index] ?? "pending"} />}
                <CardLine
                  headline={card.headline}
                  statusText={card.statusText}
                  statusTone={card.statusTone}
                  finished={card.finished}
                  showStatus={!card.finished && Boolean(current)}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {steps.length > 0 && (
          <StepCounter text={card.counter} tone={card.counterTone} expanded={expanded} />
        )}
      </motion.button>
    </div>
  );
}
