import type { ToolCallDetail } from "@interlock/protocol/agent-types";
import type { Explored, ToolChip, ToolDetail } from "@/types";
import { describeCommand } from "@/lib/shell/command";
import { baseName, short } from "@/lib/shell/parts";
import { changed, clip, exitOf, replacementLines, textDetail, unifiedLines } from "./toolDetail";

/** What a call says about itself, before its id and status are known. */
export type Said = Omit<ToolChip, "callId" | "label" | "status" | "failure">;
type Detail<T extends ToolCallDetail["type"]> = Extract<ToolCallDetail, { type: T }>;

export const withDetail = (detail: ToolDetail | undefined) => (detail ? { detail } : {});

const counted = (n: number | undefined, one: string, many: string) =>
  n === undefined ? {} : { meta: `${n} ${n === 1 ? one : many}` };

function humanize(name: string): string {
  const words = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** What Claude Code says in place of output when a command printed nothing. */
const SILENT = "(Bash completed with no output)";

export function shell(
  detail: Detail<"shell">,
  error: string | undefined,
): Said & { code?: number } {
  const summary = describeCommand(detail.command);
  const exit = exitOf(detail.exitCode, error);
  const printed = detail.output ?? exit.output;
  const output = printed === SILENT ? undefined : printed;
  return {
    action: summary.kind,
    verb: summary.verb,
    ...(summary.target ? { target: summary.target } : {}),
    ...(summary.literal ? { literal: true } : {}),
    ...(summary.explored ? { explored: summary.explored } : {}),
    detail: {
      type: "command",
      command: detail.command,
      ...(output ? { output: clip(output) } : {}),
    },
    ...(exit.code === undefined ? {} : { code: exit.code }),
  };
}

const searched: Explored = { files: [], looks: ["search"] };

export function search(detail: Detail<"search">): Said {
  const results = detail.webResults?.map((r) => `${r.title}\n${r.url}`).join("\n\n");
  const found = withDetail(textDetail(detail.content ?? detail.filePaths?.join("\n") ?? results));
  const query = `“${short(detail.query, 48)}”`;
  if (detail.toolName === "web_search") {
    return { action: "web", verb: "Searched the web for", target: query, ...found };
  }
  if (detail.toolName === "glob") {
    const files = counted(detail.numFiles ?? detail.filePaths?.length, "file", "files");
    const pattern = { target: detail.query, literal: true };
    return {
      action: "search",
      verb: "Found files matching",
      ...pattern,
      explored: searched,
      ...files,
      ...found,
    };
  }
  const count =
    detail.numMatches === undefined
      ? counted(detail.numFiles, "file", "files")
      : counted(detail.numMatches, "match", "matches");
  return {
    action: "search",
    verb: "Searched for",
    target: query,
    explored: searched,
    ...count,
    ...found,
  };
}

export function edit(detail: Detail<"edit">): Said {
  const lines = detail.unifiedDiff
    ? unifiedLines(detail.unifiedDiff)
    : replacementLines(detail.oldString ?? "", detail.newString ?? "");
  return { action: "edit", verb: "Edited", target: baseName(detail.filePath), ...changed(lines) };
}

export const write = (detail: Detail<"write">): Said => ({
  action: "write",
  verb: "Wrote",
  target: baseName(detail.filePath),
  ...changed(replacementLines("", detail.content ?? "")),
});

export const read = (detail: Detail<"read">): Said => ({
  action: "read",
  verb: "Read",
  target: baseName(detail.filePath),
  explored: { files: [detail.filePath], looks: [] },
  ...withDetail(textDetail(detail.content)),
});

export function fetched(detail: Detail<"fetch">): Said {
  const host = /^https?:\/\/([^/?#]+)/.exec(detail.url)?.[1] ?? short(detail.url, 48);
  return {
    action: "fetch",
    verb: "Fetched",
    target: host,
    ...withDetail(textDetail(detail.result)),
  };
}

/** Claude names MCP tools `mcp__server__tool`; Codex, `server.tool`. */
const MCP_NAME = /^mcp__(.+?)__(.+)$|^([\w-]+)\.([\w-]+)$/;

const background = (verb: string): Said => ({ action: "run", verb, meta: "background task" });

/** Calls that come with only their tool's name, before their input arrives or for good. */
const NAMED = new Map<string, Said>([
  ["Bash", { action: "run", verb: "Ran a command" }],
  ["Read", { action: "read", verb: "Read a file", explored: { files: [], looks: [] } }],
  ["Grep", { action: "search", verb: "Searched the code", explored: searched }],
  ["Glob", { action: "search", verb: "Found files", explored: searched }],
  ["Edit", { action: "edit", verb: "Edited a file" }],
  ["MultiEdit", { action: "edit", verb: "Edited a file" }],
  ["Write", { action: "write", verb: "Wrote a file" }],
  ["NotebookEdit", { action: "edit", verb: "Edited a notebook" }],
  ["WebFetch", { action: "fetch", verb: "Fetched a page" }],
  ["WebSearch", { action: "web", verb: "Searched the web" }],
  ["AskUserQuestion", { action: "ask", verb: "Asked you a question" }],
  ["ExitPlanMode", { action: "other", verb: "Proposed a plan" }],
  ["TaskOutput", background("Checked a command")],
  ["BashOutput", background("Checked a command")],
  ["TaskStop", background("Stopped a command")],
  ["KillShell", background("Stopped a command")],
]);

/** Claude's own notes: a background task that ended, a skill it loaded. */
export function note(detail: Detail<"plain_text">, name: string): Said {
  if (name === "task_notification") return background(detail.label ?? "Ran a command");
  if (name === "Skill" && detail.label) {
    return { action: "other", verb: "Used skill", target: detail.label, literal: true };
  }
  return {
    action: "other",
    verb: detail.label ?? humanize(name),
    ...withDetail(textDetail(detail.text)),
  };
}

export function unknown(name: string, detail: Detail<"unknown">): Said {
  const known = NAMED.get(name);
  if (known) return known;
  const input = withDetail(
    detail.input == null ? undefined : textDetail(JSON.stringify(detail.input, null, 2)),
  );
  const mcp = MCP_NAME.exec(name);
  const server = mcp?.[1] ?? mcp?.[3];
  const tool = mcp?.[2] ?? mcp?.[4];
  if (server && tool) return { action: "mcp", verb: humanize(tool), meta: server, ...input };
  return { action: "other", verb: humanize(name), ...input };
}
