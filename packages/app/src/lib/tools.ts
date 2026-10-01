import { FileSearch, FileText, Globe, Pencil, SquareTerminal, type LucideIcon } from "lucide-react";
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
  bash: {
    icon: SquareTerminal,
    label: "Run commands",
    app: "Terminal",
    verb: "Ran",
    doing: "Running",
  },
  web: { icon: Globe, label: "Use a browser", app: "Browser", verb: "Checked", doing: "Checking" },
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

const phrase: Record<ToolName, (n: number) => string> = {
  read: (n) => `read ${plural(n, "file")}`,
  search: (n) => `searched ${n === 1 ? "once" : `${n} times`}`,
  edit: (n) => `edited ${plural(n, "file")}`,
  bash: (n) => `ran ${plural(n, "command")}`,
  web: (n) => `checked the browser ${n === 1 ? "once" : `${n} times`}`,
};

/** “Read 3 files, searched once and ran 2 commands”, in the order the work happened. */
export function summarize(calls: ToolEvent[]) {
  const kinds = [...new Set(calls.map((c) => c.kind))];
  const parts = kinds.map((k) => phrase[k](calls.filter((c) => c.kind === k).length));
  const text =
    parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : (parts[0] ?? "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
