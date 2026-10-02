import type { Access, Agent } from "@/types";

export interface AccessOption {
  id: Access;
  label: string;
  blurb: string;
}

const OPTIONS: AccessOption[] = [
  {
    id: "plan",
    label: "Plan",
    blurb: "Reads the code and proposes a plan. Nothing is edited until you approve it.",
  },
  {
    id: "auto",
    label: "Auto",
    blurb: "Works freely inside its worktree and stops to ask before anything riskier.",
  },
  {
    id: "full-auto",
    label: "Full access",
    blurb: "Never stops to ask. It can edit any file and run any command, network calls included.",
  },
];

/** The level the agent is on, read from its provider mode. Codex plans through a feature toggle the daemon doesn't report, so it is only offered Auto and Full access. */
export function accessOf(agent: Pick<Agent, "kind" | "modeId">): Access {
  if (agent.modeId === "bypassPermissions" || agent.modeId === "full-access") return "full-auto";
  return agent.modeId?.includes("plan") ? "plan" : "auto";
}

const BY_KIND: Record<Agent["kind"], AccessOption[]> = {
  claude: OPTIONS,
  codex: OPTIONS.filter((o) => o.id !== "plan"),
  mock: [],
};

export const accessOptionsFor = (kind: Agent["kind"]) => BY_KIND[kind];

/** The level after `current`, wrapping around: what Shift+Tab steps through. */
export function nextAccess(options: AccessOption[], current: Access): Access {
  const at = options.findIndex((o) => o.id === current);
  return options[(at + 1) % options.length]?.id ?? current;
}
