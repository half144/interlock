import type { Automation } from "@/types";

export const automations: Automation[] = [
  {
    id: "a-sentry",
    projectId: "ledger",
    name: "Nightly Sentry triage",
    prompt:
      "Group new Sentry issues from the last 24h, drop known noise, and open a fix for anything reproducible.",
    trigger: { type: "schedule", cron: "0 3 * * *", label: "Every day at 03:00" },
    kind: "claude",
    model: "Sonnet 5.5",
    enabled: true,
    runs: [
      { minAgo: 402, result: "review", headcode: "LED-109" },
      { minAgo: 1842, result: "skipped", headcode: "LED-104" },
      { minAgo: 3282, result: "merged", headcode: "LED-97" },
      { minAgo: 4722, result: "merged", headcode: "LED-93" },
    ],
  },
  {
    id: "a-issues",
    projectId: "checkout",
    name: "Pick up issues labelled agent",
    prompt:
      'When a Linear issue gets the label "agent", read it, plan in plan mode, and wait for approval before building.',
    trigger: { type: "issue", label: "Linear label: agent" },
    kind: "claude",
    model: "Opus 5.5",
    enabled: true,
    runs: [
      { minAgo: 58, result: "review", headcode: "CHK-33" },
      { minAgo: 610, result: "merged", headcode: "CHK-30" },
    ],
  },
  {
    id: "a-deps",
    projectId: "uikit",
    name: "Weekly dependency bumps",
    prompt:
      "Bump patch and minor dependencies, run the full test suite and Storybook build, and open one PR.",
    trigger: { type: "schedule", cron: "0 9 * * 1", label: "Mondays at 09:00" },
    kind: "codex",
    model: "GPT-5.2 Codex",
    enabled: false,
    runs: [{ minAgo: 8640, result: "failed", headcode: "KIT-22" }],
  },
  {
    id: "a-review",
    projectId: "ledger",
    name: "Second-opinion review on migrations",
    prompt:
      "For every PR that adds a migration, review it for locking, backfill safety, and rollback.",
    trigger: { type: "pr", label: "PR touches migrations/**" },
    kind: "gemini",
    model: "Gemini 3 Pro",
    enabled: true,
    runs: [{ minAgo: 1210, result: "review", headcode: "LED-101" }],
  },
];
