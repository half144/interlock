/** `review` is idle with changes to look at; `idle` is idle with nothing to review. */
export type Aspect =
  | "running"
  | "held"
  | "queued"
  | "review"
  | "idle"
  | "merged"
  | "failed"
  | "discarded";

export type AgentKind = "claude" | "codex" | "mock";

/** The reasoning option the provider offers for a model: `low`, `medium`, `high`, `xhigh`, `max`. */
export type Effort = string;

export type HoldKind = "question" | "approval" | "plan" | "conflict";

export interface HoldQuestion {
  header: string;
  question: string;
  options: { label: string; description?: string }[];
  multiSelect: boolean;
  /** A free-text answer is accepted next to the options (always, when there are no options). */
  allowOther?: boolean;
  /** The question may be submitted blank. */
  allowEmpty?: boolean;
  placeholder?: string;
}

export interface Hold {
  /** The permission request this hold answers. */
  requestId: string;
  kind: HoldKind;
  title: string;
  detail: string;
  /** The command an approval asks to run. */
  command?: string;
  /** The file an approval asks to read, edit or write. */
  file?: string;
  /** The plan text of a plan approval. */
  plan?: string;
  questions?: HoldQuestion[];
  /** Button labels, primary first. `Deny` is the refusal. */
  options?: string[];
  /** What the daemon needs to turn a chosen option back into its response. */
  input?: Record<string, unknown>;
  actions?: { id: string; label: string; behavior: "allow" | "deny" }[];
}

export interface Agent {
  /** The daemon's agent id; the thread, the route and the workspace all use it. */
  id: string;
  /** The short form of the id shown next to the title. */
  headcode: string;
  projectId: string;
  workspaceId: string | null;
  threadId: string;
  cwd: string;
  title: string;
  branch: string;
  base: string;
  kind: AgentKind;
  /** The model's display name, from the provider catalog. */
  model: string;
  modelId: string | null;
  aspect: Aspect;
  /** One line on what the agent is doing right now. */
  step: string;
  /** Epoch milliseconds. */
  createdAt: number;
  updatedAt: number;
  /** When the running turn began; null while idle. */
  turnStartedAt: number | null;
  tokens: number;
  additions: number;
  deletions: number;
  files: string[];
  unseen: number;
  hold?: Hold | undefined;
  pr?: number;
  mode: "plan" | "auto";
  modeId: string | null;
  effort?: Effort;
  error?: string;
}
