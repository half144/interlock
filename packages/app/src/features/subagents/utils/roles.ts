import type { SubagentRole, SubagentStatus, ToolName } from "@/types";

/** What each kind of subagent may use, like the tools list in an agent definition. Read-only ones can't edit the worktree. */
export const roleAccess: Record<SubagentRole, { tools: ToolName[]; readOnly: boolean }> = {
  explore: { tools: ["read", "search", "bash"], readOnly: true },
  tests: { tools: ["read", "search", "edit", "bash"], readOnly: false },
  review: { tools: ["read", "search", "bash"], readOnly: true },
  migration: { tools: ["read", "edit", "bash"], readOnly: false },
  a11y: { tools: ["read", "bash", "web"], readOnly: true },
  visual: { tools: ["web"], readOnly: true },
  schema: { tools: ["read", "bash"], readOnly: true },
};

export const statusLabel: Record<SubagentStatus, string> = {
  queued: "Queued",
  running: "Working",
  done: "Done",
  failed: "Failed",
  stopped: "Stopped",
};
