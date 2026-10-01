import type { AgentSessionConfig } from "../agent/agent-sdk-types.js";
import { resolveAutonomyModeId } from "./autonomy.js";
import { ProjectSettingsStore } from "./project-settings-store.js";

export interface AgentLaunchSettingsInput {
  paseoHome: string;
  repoRoot: string;
  config: AgentSessionConfig;
  env: Record<string, string> | undefined;
}

export async function applyProjectSettingsToAgentLaunch(
  input: AgentLaunchSettingsInput,
): Promise<{ config: AgentSessionConfig; env: Record<string, string> | undefined }> {
  const settings = await ProjectSettingsStore.forHome(input.paseoHome).get(input.repoRoot);
  const modeId = resolveAutonomyModeId(
    input.config.provider,
    settings.autonomy,
    input.config.modeId,
  );
  const useDefaultModel =
    input.config.model === undefined &&
    settings.defaultModel !== null &&
    settings.defaultProvider === input.config.provider;
  const config: AgentSessionConfig = {
    ...input.config,
    ...(modeId !== undefined ? { modeId } : {}),
    ...(useDefaultModel && settings.defaultModel !== null ? { model: settings.defaultModel } : {}),
  };
  const env = Object.keys(settings.env).length > 0 ? { ...settings.env, ...input.env } : input.env;
  return { config, env };
}
