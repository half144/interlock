import type { SubagentEvent } from "@/types";
import { isTool, type ToolEvent } from "@/lib/tools";

type Entry =
  | { kind: "calls"; calls: [ToolEvent, ...ToolEvent[]] }
  | { kind: "note" | "you"; event: SubagentEvent };

/** Groups a subagent's events into chat entries: back-to-back tool calls become one group, notes and your messages stand alone. */
export function toEntries(events: SubagentEvent[]) {
  const entries: Entry[] = [];
  for (const e of events) {
    const last = entries.at(-1);
    if (!isTool(e)) entries.push({ kind: e.kind as "note" | "you", event: e });
    else if (last?.kind === "calls") last.calls.push(e);
    else entries.push({ kind: "calls", calls: [e] });
  }
  return entries;
}
