export type ToolId = "git" | "claude" | "codex" | "gh";

export type AuthProvider = "claude" | "codex";

export interface ToolStatus {
  id: ToolId;
  installed: boolean;
  version: string | null;
  loggedIn: boolean | null;
  account: string | null;
  plan: string | null;
  installCommand: string | null;
  loginCommand: string | null;
}

export type LoginState =
  | { phase: "idle" }
  | { phase: "starting"; provider: AuthProvider }
  | { phase: "waiting"; provider: AuthProvider; loginId: string; authUrl: string | null }
  | { phase: "failed"; provider: AuthProvider; message: string };
