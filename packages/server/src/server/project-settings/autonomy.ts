import type { AutonomyMode } from "@interlock/protocol/project-settings-schema";

const MODE_ID_BY_PROVIDER: Partial<Record<string, Record<AutonomyMode, string>>> = {
  claude: { auto: "auto", "full-auto": "bypassPermissions" },
  codex: { auto: "auto", "full-auto": "full-access" },
};

const PLAN_MODE_ID = "plan";

export function resolveAutonomyModeId(
  provider: string,
  autonomy: AutonomyMode,
  requestedModeId: string | undefined,
): string | undefined {
  if (requestedModeId === PLAN_MODE_ID) return requestedModeId;
  return MODE_ID_BY_PROVIDER[provider]?.[autonomy] ?? requestedModeId;
}
