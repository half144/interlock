import type { AgentKind, Autonomy } from "@/types";

const CLAUDE_MODES = { plan: "plan", auto: "auto", "full-auto": "bypassPermissions" } as const;
const CODEX_MODES = { auto: "auto", "full-auto": "full-access" } as const;

/** The provider's permission mode for a task. Codex plans through a feature toggle (see `featuresFor`); the mock provider keeps its own default. */
export function modeFor(kind: AgentKind, mode: "plan" | "auto", autonomy: Autonomy): string | null {
  if (kind === "claude") return mode === "plan" ? CLAUDE_MODES.plan : CLAUDE_MODES[autonomy];
  if (kind === "codex") return CODEX_MODES[autonomy];
  return null;
}

/** Codex's plan collaboration mode is a session feature, not a permission mode. */
export const featuresFor = (
  kind: AgentKind,
  mode: "plan" | "auto",
): Record<string, boolean> | null =>
  kind === "codex" && mode === "plan" ? { plan_mode: true } : null;

/** Plan first is offered for the providers that can plan; the mock provider has no planning mode. */
export const canPlanFirst = (kind: AgentKind) => kind === "claude" || kind === "codex";
