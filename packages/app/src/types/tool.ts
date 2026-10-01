import type { DiffLine } from "./diff";

export type ToolName = "shell" | "read" | "edit" | "write" | "search" | "fetch" | "mcp" | "other";

/** What a call did, in the transcript's words; it picks the call's icon. */
export type ToolAction =
  | "read"
  | "list"
  | "search"
  | "explore"
  | "git"
  | "edit"
  | "write"
  | "run"
  | "test"
  | "install"
  | "fetch"
  | "web"
  | "mcp"
  | "ask"
  | "other";

export type ToolCallStatus = "running" | "done" | "failed" | "stopped";

/** What opening a call shows: the command and its output, the lines an edit changed, or what it read. */
export type ToolDetail =
  | { type: "command"; command: string; output?: string }
  | { type: "diff"; lines: DiffLine[] }
  | { type: "text"; text: string };

/** How a call that only looked around did it: the files it read, and its searches, listings and git checks. */
export interface Explored {
  files: string[];
  looks: ("search" | "list" | "git")[];
}

/** One tool call as the transcript tells it: "Read count.ts", "Searched for “Stats” in src". */
export interface ToolChip {
  /** The provider's tool call id, so a later update of the call replaces its chip. */
  callId?: string;
  action: ToolAction;
  verb: string;
  target?: string;
  /** The target is literal text (a command, a glob), set in mono. */
  literal?: boolean;
  /** Verb and target as one line, for status lines. */
  label: string;
  status: ToolCallStatus;
  /** Set when it only looked around; a run of these folds into one line that counts them. */
  explored?: Explored;
  /** A short trailing fact: "12 matches", the MCP server. */
  meta?: string;
  stat?: { additions: number; deletions: number };
  /** Why it failed, in a word or two: "exit 1". */
  failure?: string;
  detail?: ToolDetail;
}
