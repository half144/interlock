import type { Agent, Subagent } from "@/types";
import { duration, elapsedOf } from "@/lib/clock";
import { toolUses } from "@/lib/tools";
import { tokens } from "@/lib/utils";

/** What a run has cost, as Claude Code counts it: “12 tool uses · 48k tokens · 1m 05s”. */
export const runStats = (sub: Subagent, agent: Agent) =>
  `${toolUses(sub)} tool uses · ${tokens(sub.tokens)} tokens · ${duration(elapsedOf(sub, agent))}`;
