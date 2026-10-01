import { useStore } from "@/stores/app-store";
import { useScrollToLatest } from "@/features/thread/hooks/useScrollToLatest";
import { useThread } from "@/features/thread/hooks/useThread";
import { transcriptSize } from "@/features/thread/utils/transcriptSize";

export function useTranscript(threadId: string) {
  const { thread, agent } = useThread(threadId);
  // Docked in the mini-IDE, the status bar and the Agents tab carry the worktree and subagents.
  const docked = useStore((s) => s.reviewMaximized);
  const messages = thread?.messages ?? [];
  const { scroller, seen } = useScrollToLatest(messages.length, transcriptSize(messages));
  return { thread, agent, docked, scroller, seen };
}
