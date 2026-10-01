import type { ProviderUsage, ToolId, ToolStatus } from "@/types";
import { TOOL_LABELS, toolOf } from "@/lib/diagnostics";

type MarkId = Exclude<ToolId, "git">;

export interface SetupMark {
  id: MarkId;
  ready: boolean;
  /** What the mark's tooltip says: the tool, its plan, whether it can work. */
  title: string;
}

const MARKS: MarkId[] = ["claude", "codex", "gh"];
const AGENTS = ["claude", "codex"] as const;

const isReady = (tool: ToolStatus) => tool.installed && tool.loggedIn === true;

function stateOf(tool: ToolStatus): string {
  if (!tool.installed) return "not installed";
  return isReady(tool) ? "ready" : "signed out";
}

const titleOf = (tool: ToolStatus, plan: string | null) =>
  [TOOL_LABELS[tool.id], plan, stateOf(tool)].filter(Boolean).join(" · ");

/** "Claude Code, Codex and GitHub", "Claude Code and GitHub". */
const listOf = (names: string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/** The one line the home tray says about this machine's setup: the next thing to do, or what is ready. */
function lineOf(tools: ToolStatus[]): { text: string; ready: boolean } {
  const signedOut = AGENTS.map((id) => toolOf(tools, id)).find(
    (tool) => tool?.installed && tool.loggedIn === false,
  );
  if (signedOut) return { text: `Sign in to ${TOOL_LABELS[signedOut.id]}`, ready: false };
  const gh = toolOf(tools, "gh");
  if (!gh?.installed) return { text: "Install the GitHub CLI to open pull requests", ready: false };
  if (!isReady(gh))
    return { text: "Sign in to the GitHub CLI to open pull requests", ready: false };
  const agents = AGENTS.flatMap((id) => {
    const tool = toolOf(tools, id);
    return tool && isReady(tool) ? [TOOL_LABELS[id]] : [];
  });
  return { text: `${listOf([...agents, "GitHub"])} ready`, ready: true };
}

export function setupStatus(tools: ToolStatus[], usage: ProviderUsage[]) {
  const marks = MARKS.flatMap((id): SetupMark[] => {
    const tool = toolOf(tools, id);
    if (!tool) return [];
    const plan = usage.find((u) => u.kind === id)?.plan ?? tool.plan;
    return [{ id, ready: isReady(tool), title: titleOf(tool, plan) }];
  });
  return { ...lineOf(tools), marks };
}
