import { useEffect, useState } from "react";
import type { SubagentEvent } from "@/types";

/**
 * Events that arrived after this chat opened. Only those animate in: not the history already on screen,
 * and not again on the store's tick. Events keep their identity across ticks, so a WeakSet tracks them.
 */
export function useFresh(events: SubagentEvent[]) {
  const [seen] = useState(() => new WeakSet(events));
  useEffect(() => {
    for (const e of events) seen.add(e);
  });
  return (e: SubagentEvent) => !seen.has(e);
}
