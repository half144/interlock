import { useState } from "react";
import { useStore } from "@/stores/app-store";
import type { Agent, Thread } from "@/types";
import { worktreeCardLine } from "@/features/thread/utils/worktreeCard";

export function useWorktreeCard(agent: Agent, thread: Thread) {
  const openPanel = useStore((s) => s.openPanel);
  const [expanded, setExpanded] = useState(false);
  const line = worktreeCardLine(agent, thread, expanded);

  return {
    ...line,
    expanded,
    toggle: () => line.steps.length > 0 && setExpanded((e) => !e),
    openWorktree: () => openPanel("terminal"),
  };
}
