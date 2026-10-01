import type { ToolStatus } from "@/types";
import { stateOf } from "@/lib/diagnostics";

export function subtitleOf(tool: ToolStatus): string {
  const state = stateOf(tool);
  if (state === "missing") return "Not installed";
  if (state === "needs-login") return "Installed, signed out";
  return [tool.account, tool.plan, tool.version && `v${tool.version}`].filter(Boolean).join(" · ");
}
