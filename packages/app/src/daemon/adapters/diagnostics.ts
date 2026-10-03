import type { ToolDiagnostic } from "@interlock/protocol/accounts-schema";
import { ProviderOverrideSchema } from "@interlock/protocol/provider-config";
import type { MutableDaemonConfigPatch } from "@interlock/protocol/messages";
import type { AuthProvider, ToolStatus } from "@/types";

export const toToolStatus = (tool: ToolDiagnostic, providerConfig: unknown = {}): ToolStatus => ({
  id: tool.id,
  installed: tool.installed,
  version: tool.version,
  loggedIn: tool.loggedIn,
  account: tool.account,
  plan: tool.plan,
  installCommand: tool.installCommand,
  loginCommand: tool.loginCommand,
  executable: ProviderOverrideSchema.parse(providerConfig).command?.[0] ?? tool.id,
  path: tool.path,
});

export function toExecutablePatch(
  provider: AuthProvider,
  executable: string,
  providerConfig: unknown,
): MutableDaemonConfigPatch {
  const previous = ProviderOverrideSchema.parse(providerConfig);
  return {
    providers: {
      [provider]: { command: [executable.trim(), ...(previous.command?.slice(1) ?? [])] },
    },
  };
}
