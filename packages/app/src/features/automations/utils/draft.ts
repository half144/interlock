import type { AgentKind, Automation, Trigger } from "@/types";
import { describeCron } from "./cron";

export type TriggerType = Trigger["type"];

export const DEFAULT_ISSUE_LABEL = "Linear label: agent";

/** A new automation as it's being filled in; every trigger type keeps its own field so switching tabs loses nothing. */
export interface Draft {
  name: string;
  type: TriggerType;
  cron: string;
  label: string;
  source: string;
  prompt: string;
  projectId: string;
  kind: AgentKind;
  model: string;
}

export const BLANK_DRAFT: Draft = {
  name: "",
  type: "schedule",
  cron: "0 9 * * 1-5",
  label: "",
  source: "Sentry",
  prompt: "",
  projectId: "",
  kind: "claude",
  model: "",
};

export const TEMPLATES: { label: string; draft: Partial<Draft> }[] = [
  {
    label: "Nightly Sentry triage",
    draft: {
      name: "Nightly Sentry triage",
      type: "schedule",
      cron: "0 3 * * *",
      prompt:
        "Group new Sentry issues from the last 24h, drop known noise, and open a fix for anything reproducible.",
    },
  },
  {
    label: "Issue label → plan",
    draft: {
      name: "Plan issues labelled agent",
      type: "issue",
      label: DEFAULT_ISSUE_LABEL,
      kind: "claude",
      prompt: "Read the issue, write a plan in plan mode, and wait for approval before building.",
    },
  },
  {
    label: "Weekly dependency bumps",
    draft: {
      name: "Weekly dependency bumps",
      type: "schedule",
      cron: "0 9 * * 1",
      kind: "codex",
      prompt:
        "Bump patch and minor dependencies, run the full suite and the Storybook build, and open one PR.",
    },
  },
  {
    label: "Review PRs touching migrations",
    draft: {
      name: "Migration second opinion",
      type: "pr",
      label: "PR touches migrations/**",
      kind: "codex",
      prompt:
        "Review the migration for locking, backfill safety and rollback. Comment on the PR, do not push.",
    },
  },
];

export const ALERT_SOURCES = ["Sentry", "Datadog", "PagerDuty"];

function toTrigger(d: Draft): Trigger {
  if (d.type === "schedule") return { type: "schedule", cron: d.cron, label: describeCron(d.cron) };
  if (d.type === "alert") return { type: "alert", source: d.source };
  return { type: d.type, label: d.label || (d.type === "issue" ? DEFAULT_ISSUE_LABEL : "Any PR") };
}

export function toAutomation(d: Draft): Automation {
  return {
    id: `a-${Date.now()}`,
    projectId: d.projectId,
    name: d.name.trim(),
    prompt: d.prompt.trim(),
    trigger: toTrigger(d),
    kind: d.kind,
    model: d.model,
    enabled: true,
    runs: [],
  };
}
