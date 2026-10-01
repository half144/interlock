import type { AuthProvider, ToolStatus } from "@/types";
import { openExternal } from "@/platform/desktop";
import { toToolStatus } from "./adapters/diagnostics";
import { getClient } from "./client";

export async function fetchDiagnostics(): Promise<ToolStatus[]> {
  const result = await getClient().getDiagnostics();
  if (result.error) throw new Error(result.error);
  return result.tools.map(toToolStatus);
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
