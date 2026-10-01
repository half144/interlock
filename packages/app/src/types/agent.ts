export type Aspect = "running" | "held" | "queued" | "review" | "merged" | "failed" | "discarded";

export type AgentKind = "claude" | "codex" | "gemini";

/** How hard the agent thinks before acting. Claude sends it as a thinking budget, Codex as its reasoning effort. */
export type Effort = "low" | "medium" | "high" | "max";

export type HoldKind = "question" | "approval" | "plan" | "conflict";

export interface Hold {
  kind: HoldKind;
  title: string;
  detail: string;
  options?: string[];
}

export interface Checks {
  passed: number;
  failed: number;
  pending: number;
}

export interface Agent {
  id: string;
  headcode: string;
  projectId: string;
  threadId: string;
  title: string;
  branch: string;
  base: string;
  kind: AgentKind;
  model: string;
  aspect: Aspect;
  progress: number;
  step: string;
  startedMin: number;
  tokens: number;
  cost: number;
  additions: number;
  deletions: number;
  files: string[];
  checks: Checks;
  unseen: number;
  hold?: Hold | undefined;
  pr?: number;
  mode: "plan" | "auto";
  /** Unset means the default, medium. */
  effort?: Effort;
}
