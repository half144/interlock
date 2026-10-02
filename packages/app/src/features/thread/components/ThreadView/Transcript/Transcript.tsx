import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { Dock } from "@/components/ui/Dock/Dock";
import { Outcome } from "@/features/thread/components/ThreadView/Transcript/Outcome/Outcome";
import { isFinished } from "@/lib/agentStatus";
import { READING_WIDTH } from "@/lib/layout";
import { JumpToLatest } from "./JumpToLatest/JumpToLatest";
import { Composer } from "./Composer/Composer";
import { MessageItem } from "./MessageItem/MessageItem";
import { THINKING_DELAY } from "./MessageItem/rise";
import { ThinkingLine } from "./ThinkingLine/ThinkingLine";
import { ThreadTray } from "./ThreadTray/ThreadTray";
import { useTranscript } from "./useTranscript";
import { WorktreeCard } from "./WorktreeCard/WorktreeCard";

/**
 * The conversation fills its column up to the reading width, so it follows the column as it narrows beside the
 * panel instead of racing it on a spring of its own and spilling out of its sides. `reading` only paces the focus.
 */
export function Transcript({
  threadId,
  reading,
}: {
  threadId: string;
  reading: MotionValue<number>;
}) {
  const {
    thread,
    agent,
    messages,
    thinking,
    card,
    docked,
    scroller,
    content,
    dock,
    seen,
    focus,
    away,
    jump,
    stopped,
    onStop,
  } = useTranscript(threadId, reading);

  if (!thread || !agent) return null;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <motion.div
        aria-hidden
        style={{ opacity: focus.haze, bottom: focus.clearance }}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 backdrop-blur-[4px]"
      />
      <JumpToLatest visible={away} clearance={focus.clearance} onJump={jump} />
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <motion.div
          ref={content}
          className="mx-auto flex w-full flex-1 flex-col gap-7 px-6 pt-6 pb-2"
          style={{ maxWidth: READING_WIDTH }}
        >
          {messages.map((m, i) => (
            <MessageItem
              key={m.id}
              message={m}
              animate={i >= seen.current}
              streaming={i === messages.length - 1 && agent.aspect === "running"}
              footer={
                i === messages.length - 1 && (
                  <ThinkingLine
                    key="thinking"
                    text={thinking}
                    delay={i >= seen.current ? THINKING_DELAY : 0}
                  />
                )
              }
            />
          ))}
          <AnimatePresence initial={false}>
            {isFinished(agent) && <Outcome key="outcome" agent={agent} stopped={stopped} />}
          </AnimatePresence>
        </motion.div>
        <Dock surface="panel">
          <motion.div
            ref={dock}
            className="mx-auto w-full px-6 pb-4"
            style={{ maxWidth: READING_WIDTH }}
          >
            <AnimatePresence initial={false}>
              {card && <WorktreeCard key="card" agent={agent} thread={thread} />}
            </AnimatePresence>
            <Composer thread={thread} agent={agent} onStop={onStop} />
            {!docked && <ThreadTray agent={agent} />}
          </motion.div>
        </Dock>
      </div>
    </div>
  );
}
