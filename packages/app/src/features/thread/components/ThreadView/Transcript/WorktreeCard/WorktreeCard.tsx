import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import type { Agent, Thread } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { finishedLabel, isFinished, statusLine } from "@/lib/agentStatus";
import { planProgress } from "@/features/thread/utils/planSteps";
import { StepList } from "./StepList/StepList";
import { WorktreeScreen } from "./WorktreeScreen/WorktreeScreen";
import { WorktreeMark, type WorktreeMarkKind } from "./WorktreeMark/WorktreeMark";

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
  const openPanel = useStore((s) => s.openPanel);
  const [expanded, setExpanded] = useState(false);
  const { steps, statuses, done, index, current, headline } = planProgress(agent, thread);
  const finished = isFinished(agent);
  const statusText = statusLine(agent);
  const mark: WorktreeMarkKind = finished
    ? agent.aspect === "merged"
      ? "merged"
      : "review"
    : "step";

  return (
    <div className="relative mx-2 -mb-4 rounded-t-2xl border border-b-0 border-seam bg-inset pb-4">
      <WorktreeScreen
        label={`Open ${agentLabel(agent)}’s worktree`}
        finished={finished}
        onOpen={() => openPanel("terminal")}
      />

      <Collapse open={expanded}>
        <div className="min-h-[34px] pt-2 pr-3.5 pl-[88px]">
          <p className="truncate text-[13.5px] font-medium text-ink">
            {agentLabel(agent)}’s worktree
          </p>
          <p
            className={cn(
              "truncate text-[12px]",
              agent.aspect === "running" ? "shimmer" : "text-ink-3",
            )}
          >
            {statusText}
          </p>
        </div>
        <StepList steps={steps} statuses={statuses} />
      </Collapse>

      {/* The row settles to a shorter height once the work is done, rather than snapping. */}
      <motion.button
        type="button"
        onClick={() => steps.length > 0 && setExpanded((e) => !e)}
        aria-expanded={steps.length > 0 ? expanded : undefined}
        initial={false}
        animate={{ height: finished || !current ? 40 : 56 }}
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
                {current && <WorktreeMark kind={mark} status={statuses[index] ?? "pending"} />}
                <span className="min-w-0 flex-1">
                  <SwapText
                    text={headline ?? statusText}
                    className={cn(
                      "text-[13.5px] transition-colors duration-300",
                      finished ? "text-ink-2" : "text-ink",
                    )}
                  />
                  {!finished && current && (
                    <SwapText
                      text={statusText}
                      className={cn(
                        "text-[12px]",
                        agent.aspect === "running"
                          ? "shimmer"
                          : agent.aspect === "held"
                            ? "text-hold"
                            : "text-ink-3",
                      )}
                    />
                  )}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {steps.length > 0 && (
          <>
            <span className="shrink-0">
              <SwapText
                text={finished && !expanded ? finishedLabel(agent) : `${done} / ${steps.length}`}
                className={cn(
                  "text-right tabular-nums",
                  finished && !expanded
                    ? agent.aspect === "merged"
                      ? "text-[12.5px] text-merge"
                      : "text-[12.5px] text-green"
                    : "text-[13px] text-ink-3",
                )}
              />
            </span>
            <ChevronUp
              className={cn(
                "size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-quint",
                expanded && "rotate-180",
              )}
            />
          </>
        )}
      </motion.button>
    </div>
  );
}
