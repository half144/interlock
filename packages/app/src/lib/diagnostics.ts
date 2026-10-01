import type { AuthProvider, LoginState, ToolId, ToolStatus } from "@/types";

export const TOOL_LABELS: Record<ToolId, string> = {
  git: "Git",
  claude: "Claude Code",
  codex: "Codex",
  gh: "GitHub CLI",
};

export const toolOf = (tools: ToolStatus[], id: ToolId) => tools.find((t) => t.id === id);

const isUsable = (tool: ToolStatus | undefined) =>
  tool !== undefined && tool.installed && tool.loggedIn === true;

/** Git is required, and so is at least one agent that is installed and logged in. */
export function needsSetup(tools: ToolStatus[]): boolean {
  return (
    !toolOf(tools, "git")?.installed ||
    !(isUsable(toolOf(tools, "claude")) || isUsable(toolOf(tools, "codex")))
  );
}

/** What a tool is, in one word the card shows next to its name. */
export type ToolState = "ready" | "needs-login" | "missing";

export function stateOf(tool: ToolStatus): ToolState {
  if (!tool.installed) return "missing";
  return tool.loggedIn === false ? "needs-login" : "ready";
}

export function finishLogin(
  state: LoginState,
  done: { provider: AuthProvider; loginId: string; success: boolean; error: string | null },
): LoginState {
  if (state.phase !== "waiting" || state.loginId !== done.loginId) return state;
  if (done.success) return { phase: "idle" };
  return {
    phase: "failed",
    provider: done.provider,
    message: done.error ?? "The login did not finish. Try again.",
  };
}
