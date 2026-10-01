import type { ToolName } from "./tool";

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
  /** Seconds into the parent task. */
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
  /** The tool call of the parent that started it. */
  toolCallId: string | null;
  name: string;
  brief: string;
  /** The provider's compact line: model, effort and tokens when it reports them. */
  subtitle: string | null;
  status: SubagentStatus;
  /** Seconds into the parent task. */
  startSec: number;
  endSec?: number | undefined;
  events: SubagentEvent[];
  result?: string | undefined;
}
