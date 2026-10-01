import type { Agent, Subagent } from "@/types";
import { duration, elapsedOf } from "@/lib/clock";
import { toolUses } from "@/lib/tools";
import { plural } from "@/lib/utils";
import { statusLabel } from "./statusLabel";

/** "Done · 12 tool uses · 1m 02s", the line a finished subagent ends on. */
export const statusLine = (sub: Subagent, agent: Agent) =>
  `${statusLabel[sub.status]} · ${plural(toolUses(sub), "tool use")} · ${duration(elapsedOf(sub, agent))}`;
