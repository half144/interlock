import {
  FileSearch,
  FileText,
  Globe,
  PencilLine,
  Pencil,
  Plug,
  SquareTerminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Subagent, SubagentEvent, ToolName } from "@/types";
import { plural } from "@/lib/utils";

interface ToolInfo {
  icon: LucideIcon;
  /** What the capability is called when listing what an agent can use. */
  label: string;
  /** The surface the call happens in, as in “Explorer is using Terminal”. */
  app: string;
  verb: string;
  doing: string;
}

export const tools: Record<ToolName, ToolInfo> = {
  read: { icon: FileText, label: "Read files", app: "Editor", verb: "Read", doing: "Reading" },
  search: {
    icon: FileSearch,
    label: "Search code",
    app: "Search",
    verb: "Searched",
    doing: "Searching for",
  },
  edit: { icon: Pencil, label: "Edit files", app: "Editor", verb: "Edited", doing: "Editing" },
  write: {
    icon: PencilLine,
    label: "Write files",
    app: "Editor",
    verb: "Wrote",
    doing: "Writing",
  },
  shell: {
    icon: SquareTerminal,
    label: "Run commands",
    app: "Terminal",
    verb: "Ran",
    doing: "Running",
  },
  fetch: { icon: Globe, label: "Fetch pages", app: "Browser", verb: "Fetched", doing: "Fetching" },
  mcp: { icon: Plug, label: "Use MCP tools", app: "MCP", verb: "Called", doing: "Calling" },
  other: { icon: Wrench, label: "Use tools", app: "Tools", verb: "Used", doing: "Using" },
};

export type ToolEvent = SubagentEvent & { kind: ToolName };

export const isTool = (e: SubagentEvent): e is ToolEvent => e.kind !== "note" && e.kind !== "you";

export const toolUses = (sub: Subagent) => sub.events.filter(isTool).length;

export const lastCall = (sub: Subagent) => sub.events.findLast(isTool);

/** “Running pnpm migrate:plan 0142”: the call a working subagent is on right now. */
export function doing(sub: Subagent) {
  const call = lastCall(sub);
  if (!call) return "Getting started";
  return `${tools[call.kind].doing} ${call.kind === "search" ? `“${call.text}”` : call.text}`;
}

const times = (n: number) => (n === 1 ? "once" : `${n} times`);

const phrase: Record<ToolName, (n: number) => string> = {
  read: (n) => `read ${plural(n, "file")}`,
  search: (n) => `searched ${times(n)}`,
  edit: (n) => `edited ${plural(n, "file")}`,
  write: (n) => `wrote ${plural(n, "file")}`,
  shell: (n) => `ran ${plural(n, "command")}`,
  fetch: (n) => `fetched ${plural(n, "page")}`,
  mcp: (n) => `called an MCP tool ${times(n)}`,
  other: (n) => `used another tool ${times(n)}`,
};

/** “Read 3 files, searched once and ran 2 commands”, in the order the work happened. */
export function summarize(calls: ToolEvent[]) {
  const kinds = [...new Set(calls.map((c) => c.kind))];
  const parts = kinds.map((k) => phrase[k](calls.filter((c) => c.kind === k).length));
  const text =
    parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : (parts[0] ?? "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
