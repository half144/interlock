import type { ToolCallDetail, ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import type { ToolChip, ToolName } from "@/types";

const NAMED = new Set<ToolCallDetail["type"]>([
  "shell",
  "read",
  "edit",
  "write",
  "search",
  "fetch",
]);

const baseName = (path: string) => path.split("/").at(-1) ?? path;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function toolNameOf(item: ToolCallTimelineItem): ToolName {
  const type = item.detail.type;
  if (NAMED.has(type)) return type as ToolName;
  return item.name.startsWith("mcp") ? "mcp" : "other";
}

function searchLabel(detail: Extract<ToolCallDetail, { type: "search" }>): string {
  const count = detail.numMatches ?? detail.numFiles ?? detail.filePaths?.length;
  return `Searched “${detail.query}”${count === undefined ? "" : ` · ${plural(count, "result")}`}`;
}

function shellLabel(detail: Extract<ToolCallDetail, { type: "shell" }>): string {
  const exit = detail.exitCode == null ? "" : ` · exit ${detail.exitCode}`;
  return `Ran \`${detail.command}\`${exit}`;
}

function labelOf(item: ToolCallTimelineItem): string {
  const { detail } = item;
  if (detail.type === "shell") return shellLabel(detail);
  if (detail.type === "search") return searchLabel(detail);
  if (detail.type === "read") return `Read ${baseName(detail.filePath)}`;
  if (detail.type === "edit") return `Edited ${detail.filePath}`;
  if (detail.type === "write") return `Wrote ${detail.filePath}`;
  if (detail.type === "fetch") return `Fetched ${detail.url}`;
  if (detail.type === "plain_text") return detail.label ?? item.name;
  return item.name;
}

export function toolChip(item: ToolCallTimelineItem): ToolChip {
  return {
    callId: item.callId,
    tool: toolNameOf(item),
    label: labelOf(item),
    ...(item.status === "failed" ? { failed: true } : {}),
  };
}
