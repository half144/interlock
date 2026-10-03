import type { AuthProvider, ToolStatus } from "@/types";
import { openExternal } from "@/platform/desktop";
import { toExecutablePatch, toToolStatus } from "./adapters/diagnostics";
import { getClient } from "./client";

export async function fetchDiagnostics(): Promise<ToolStatus[]> {
  const client = getClient();
  const { config } = await client.getDaemonConfig();
  const result = await client.getDiagnostics();
  if (result.error) throw new Error(result.error);
  return result.tools.map((tool) => toToolStatus(tool, config.providers[tool.id] ?? {}));
}

export async function saveExecutable(provider: AuthProvider, executable: string): Promise<void> {
  const client = getClient();
  const { config } = await client.getDaemonConfig();
  await client.patchDaemonConfig(
    toExecutablePatch(provider, executable, config.providers[provider] ?? {}),
  );
}

export interface LoginStart {
  loginId: string;
  authUrl: string | null;
}

export async function startLogin(provider: AuthProvider): Promise<LoginStart> {
  const result = await getClient().startProviderLogin(provider);
  if (result.error || !result.loginId) {
    throw new Error(result.error ?? "The login did not start. Try again.");
  }
  if (!result.opensBrowser && result.authUrl) await openExternal(result.authUrl);
  return { loginId: result.loginId, authUrl: result.authUrl };
}

export async function logout(provider: AuthProvider): Promise<void> {
  const result = await getClient().logoutProvider(provider);
  if (result.error) throw new Error(result.error);
}
