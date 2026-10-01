import type { Agent, Aspect, LogLine } from "@/types";
import { isFinished } from "@/lib/agentStatus";

type CheckStatus = "passed" | "failed" | "running" | "waiting";

export interface Check {
  name: string;
  detail: string;
  status: CheckStatus;
  duration: string;
}

export const checkLamp: Record<CheckStatus, Aspect> = {
  passed: "merged",
  failed: "failed",
  running: "running",
  waiting: "queued",
};
export const checkLabel: Record<CheckStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  running: "Running",
  waiting: "Waiting",
};

/** The CI checks a task would run, with statuses that follow the agent's progress and test results. */
export function checksFor(agent: Agent): Check[] {
  const { passed, failed, pending } = agent.checks;
  const ran = passed + failed + pending > 0;
  const done = isFinished(agent);
  const live = agent.aspect === "running";
  const unit: CheckStatus =
    failed > 0 ? "failed" : pending > 0 ? "running" : ran ? "passed" : live ? "running" : "waiting";

  return [
    {
      name: "Typecheck",
      detail: "tsc --noEmit",
      status: ran || done ? "passed" : live ? "running" : "waiting",
      duration: "38s",
    },
    {
      name: "Lint",
      detail: "eslint --max-warnings 0",
      status: ran || done ? "passed" : "waiting",
      duration: "12s",
    },
    {
      name: "Unit tests",
      detail: ran ? `${passed} passed · ${failed} failed · ${pending} pending` : "vitest run",
      status: unit,
      duration: "1m 42s",
    },
    {
      name: agent.projectId === "checkout" ? "E2E checkout" : "Integration",
      detail: "playwright · chromium, webkit",
      status: done ? "passed" : unit === "failed" ? "waiting" : ran ? "running" : "waiting",
      duration: "3m 10s",
    },
    {
      name: "Preview deploy",
      detail: `${agent.headcode.toLowerCase()}.preview.lumen.dev`,
      status: done ? "passed" : "waiting",
      duration: "1m 05s",
    },
  ];
}

export function failureOutput(agent: Agent, logs: LogLine[] | undefined) {
  const errors = (logs ?? []).filter((l) => l.kind === "err").map((l) => l.text);
  return errors.length
    ? errors
    : [` ✗ ${agent.files[0] ?? "test"} > regression case`, "   Expected: true  Received: false"];
}
