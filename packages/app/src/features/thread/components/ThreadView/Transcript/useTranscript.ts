import { useMemo } from "react";
import type { MotionValue } from "motion/react";
import { useStore } from "@/stores/app-store";
import { useDockFocus } from "@/features/thread/hooks/useDockFocus";
import { useScrollToLatest } from "@/features/thread/hooks/useScrollToLatest";
import { useThread } from "@/features/thread/hooks/useThread";
import { turnPlan } from "@/features/thread/utils/planSteps";
import { thinkingLine, withPendingReply } from "@/features/thread/utils/thinking";
import { withoutStaleCards } from "@/features/thread/utils/trailing";

export function useTranscript(threadId: string, reading: MotionValue<number>) {
  const { thread, agent } = useThread(threadId);
  // Docked in the mini-IDE, the status bar and the Agents tab carry the worktree and subagents.
  const docked = useStore((s) => s.reviewMaximized);
  const messages = useMemo(
    () => (thread && agent ? withoutStaleCards(withPendingReply(thread.messages, agent)) : []),
    [thread, agent],
  );
  const reply = messages.at(-1);
  const thinking = agent && reply?.role === "agent" ? thinkingLine(agent, reply.blocks) : null;
  const { scroller, content, dock, seen } = useScrollToLatest(messages.length);
  const card = !docked && thread !== undefined && turnPlan(thread).length > 0;
  const focus = useDockFocus(reading, dock);
  return { thread, agent, messages, thinking, card, docked, scroller, content, dock, seen, focus };
}
