import { useRef } from "react";
import type { Subagent } from "@/types";
import { useFollowScroll } from "@/features/subagents/hooks/useFollowScroll";

export function useSubagentChat(sub: Subagent) {
  const scroller = useRef<HTMLDivElement>(null);
  useFollowScroll(scroller, `${sub.events.length}:${sub.status}`);
  return { scroller };
}
