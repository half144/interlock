import type { ToolDiagnostic } from "@interlock/protocol/accounts-schema";
import type { ToolStatus } from "@/types";

export const toToolStatus = (tool: ToolDiagnostic): ToolStatus => ({
  id: tool.id,
  installed: tool.installed,
  version: tool.version,
  loggedIn: tool.loggedIn,
  account: tool.account,
  plan: tool.plan,
  installCommand: tool.installCommand,
  loginCommand: tool.loginCommand,
});
