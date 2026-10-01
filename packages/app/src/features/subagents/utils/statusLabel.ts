import type { SubagentStatus } from "@/types";

export const statusLabel: Record<SubagentStatus, string> = {
  queued: "Queued",
  running: "Working",
  done: "Done",
  failed: "Failed",
  stopped: "Stopped",
};
