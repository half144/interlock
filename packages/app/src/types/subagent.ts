import type { ToolName } from "./tool";

export type SubagentRole =
  | "explore"
  | "tests"
  | "review"
  | "migration"
  | "a11y"
  | "visual"
  | "schema";

export type SubagentStatus = "queued" | "running" | "done" | "failed" | "stopped";

/**
 * One thing a subagent did. Tool calls carry what it actually saw, so the chat can show the file
 * excerpt, the search hits or the command output instead of just naming the call.
 */
export interface SubagentEvent {
  /** `note` is the subagent talking; `you` is a message you sent it. */
  kind: ToolName | "note" | "you";
  /** Path, query, command or URL for tool calls; the words themselves for notes and messages. */
  text: string;
  sec: number;
  /** Short trailing fact: a line range, a result count, an exit status, a diff size. */
  meta?: string;
  body?: string[] | undefined;
  /** First line number of a file excerpt in `body`. */
  from?: number;
}

export interface Subagent {
  id: string;
  parentId: string;
  role: SubagentRole;
  name: string;
  brief: string;
  status: SubagentStatus;
  progress: number;
  startSec: number;
  endSec?: number | undefined;
  /** Time it sat finished before you messaged it again, left out of how long it worked. */
  idleSec?: number | undefined;
  model: string;
  tokens: number;
  cost: number;
  events: SubagentEvent[];
  result?: string | undefined;
  findings?: string[] | undefined;
  usedIn?: string | undefined;
}
