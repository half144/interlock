import type { MotionValue } from "motion/react";
import { useStore } from "@/stores/app-store";
import { useDockFocus } from "@/features/thread/hooks/useDockFocus";
import { useScrollToLatest } from "@/features/thread/hooks/useScrollToLatest";
import { useThread } from "@/features/thread/hooks/useThread";
import { turnPlan } from "@/features/thread/utils/planSteps";
import { thinkingLine, withPendingReply } from "@/features/thread/utils/thinking";
import { transcriptSize } from "@/features/thread/utils/transcriptSize";

export function useTranscript(threadId: string, reading: MotionValue<number>) {
  const { thread, agent } = useThread(threadId);
  // Docked in the mini-IDE, the status bar and the Agents tab carry the worktree and subagents.
  const docked = useStore((s) => s.reviewMaximized);
  const messages = thread && agent ? withPendingReply(thread.messages, agent) : [];
  const reply = messages.at(-1);
  const thinking = agent && reply?.role === "agent" ? thinkingLine(agent, reply.blocks) : null;
  const { scroller, dock, seen } = useScrollToLatest(
    messages.length,
    transcriptSize(messages, thinking !== null),
  );
  const card = !docked && thread !== undefined && turnPlan(thread).length > 0;
  const focus = useDockFocus(reading, dock);
  return { thread, agent, messages, thinking, card, docked, scroller, dock, seen, focus };
}
