import type { ToolCallDetail, ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import type { ToolCallStatus, ToolChip, ToolDetail, ToolName } from "@/types";
import { progressive } from "@/lib/progressive";
import { errorText, textDetail } from "./toolDetail";
import {
  edit,
  fetched,
  note,
  read,
  search,
  shell,
  unknown,
  withDetail,
  write,
  type Said,
} from "./toolDescribers";

type Detail<T extends ToolCallDetail["type"]> = Extract<ToolCallDetail, { type: T }>;

const NAMED = new Set<ToolCallDetail["type"]>([
  "shell",
  "read",
  "edit",
  "write",
  "search",
  "fetch",
]);

export function toolNameOf(item: ToolCallTimelineItem): ToolName {
  const type = item.detail.type;
  if (NAMED.has(type)) return type as ToolName;
  return item.name.startsWith("mcp") ? "mcp" : "other";
}

/**
 * Calls that keep the agent's own books, not the user's project: its plan (shown as the plan's steps),
 * plan mode and deferred tool loading.
 */
const BOOKKEEPING = new Set([
  "TodoWrite",
  "TaskCreate",
  "TaskUpdate",
  "TaskList",
  "TaskGet",
  "EnterPlanMode",
  "ToolSearch",
]);

export const isBookkeeping = (item: ToolCallTimelineItem) => BOOKKEEPING.has(item.name);

const STATUS: Record<ToolCallTimelineItem["status"], ToolCallStatus> = {
  running: "running",
  completed: "done",
  failed: "failed",
  canceled: "stopped",
};

type Describers = {
  [T in ToolCallDetail["type"]]: (detail: Detail<T>, name: string) => Said;
};

const DESCRIBERS: Describers = {
  shell: (detail) => shell(detail, undefined),
  read,
  search,
  edit,
  write,
  fetch: fetched,
  unknown: (detail, name) => unknown(name, detail),
  worktree_setup: (detail) => ({
    action: "run",
    verb: "Set up the worktree",
    target: detail.branchName,
    literal: true,
  }),
  sub_agent: (detail) => ({ action: "other", verb: detail.description ?? "Ran a subagent" }),
  plain_text: note,
  plan: (detail) => ({
    action: "other",
    verb: "Proposed a plan",
    ...withDetail(textDetail(detail.text)),
  }),
};

// TypeScript can't tie a detail to the describer of its own type through the lookup, so the call widens it.
const describe = ({ detail, name }: ToolCallTimelineItem) =>
  (DESCRIBERS[detail.type] as (detail: ToolCallDetail, name: string) => Said)(detail, name);

interface Ending {
  status: ToolCallStatus;
  failure?: string;
  detail?: ToolDetail;
}

/** How the call ended; a failure says how in a word, and shows why when the reason isn't its own name. */
function ending(
  item: ToolCallTimelineItem,
  code: number,
  error: string | undefined,
  label: string,
): Ending {
  if (item.status !== "failed" && !code) return { status: STATUS[item.status] };
  const reason = item.detail.type !== "shell" && error !== label ? textDetail(error) : undefined;
  return { status: "failed", failure: code ? `exit ${code}` : "failed", ...withDetail(reason) };
}

export function toolChip(item: ToolCallTimelineItem): ToolChip {
  const error = item.status === "failed" ? errorText(item.error) : undefined;
  const { code = 0, ...said }: Said & { code?: number } =
    item.detail.type === "shell" ? shell(item.detail, error) : describe(item);
  const verb = item.status === "running" ? progressive(said.verb) : said.verb;
  const label = said.target ? `${verb} ${said.target}` : verb;
  return { ...said, callId: item.callId, verb, label, ...ending(item, code, error, label) };
}
