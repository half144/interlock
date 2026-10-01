import type { Subagent } from "@/types";
import { isTool, type ToolEvent } from "@/lib/tools";

const SHOWN = 3;

/** The latest tool calls of a subagent, and how many earlier ones are folded into "+N tool uses". */
export function recentCalls(sub: Subagent): { shown: ToolEvent[]; hidden: number } {
  const calls = sub.events.filter(isTool);
  return { shown: calls.slice(-SHOWN), hidden: Math.max(0, calls.length - SHOWN) };
}
