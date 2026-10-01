import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { Dock } from "@/components/ui/Dock/Dock";
import { Outcome } from "@/features/thread/components/ThreadView/Transcript/Outcome/Outcome";
import { isFinished } from "@/lib/agentStatus";
import { Composer } from "./Composer/Composer";
import { MessageItem } from "./MessageItem/MessageItem";
import { ThreadTray } from "./ThreadTray/ThreadTray";
import { useTranscript } from "./useTranscript";
import { WorktreeCard } from "./WorktreeCard/WorktreeCard";

/**
 * `reading` is the conversation's width: its usual width on its own, the chat's width beside the open panel.
 * It never exceeds the scroller, whose scrollbar would otherwise push it into a sideways scroll.
 */
export function Transcript({
  threadId,
  reading,
}: {
  threadId: string;
  reading: MotionValue<number>;
}) {
  const { thread, agent, docked, scroller, seen } = useTranscript(threadId);

  if (!thread || !agent) return null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <motion.div
          className="mx-auto flex max-w-full flex-1 flex-col gap-7 px-6 pt-6 pb-2"
          style={{ width: reading }}
        >
          {thread.messages.map((m, i) => (
            <MessageItem key={m.id} message={m} animate={i >= seen.current} />
          ))}
          <AnimatePresence initial={false}>
            {isFinished(agent) && <Outcome key="outcome" agent={agent} />}
          </AnimatePresence>
        </motion.div>
        <Dock surface="panel">
          <motion.div className="mx-auto max-w-full px-6 pb-4" style={{ width: reading }}>
            {!docked && <WorktreeCard agent={agent} thread={thread} />}
            <Composer thread={thread} agent={agent} />
            {!docked && <ThreadTray agent={agent} />}
          </motion.div>
        </Dock>
      </div>
    </div>
  );
}
