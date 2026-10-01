import type { Check } from "@/types";
import { plural } from "./utils";

export type ChecksState = "none" | "pending" | "failing" | "passing";

export interface ChecksSummary {
  state: ChecksState;
  total: number;
  label: string;
}

const isDone = (check: Check) => check.state !== "pending";
const isFailed = (check: Check) => check.state === "failure" || check.state === "cancelled";

/** One line for a PR's checks: failures win over running checks, which win over passing. */
export function summarizeChecks(checks: Check[]): ChecksSummary {
  const total = checks.length;
  if (!total) return { state: "none", total, label: "No checks" };
  const failed = checks.filter(isFailed).length;
  if (failed) return { state: "failing", total, label: `${plural(failed, "check")} failing` };
  const running = checks.filter((check) => !isDone(check)).length;
  if (running) return { state: "pending", total, label: `${plural(running, "check")} running` };
  const passed = checks.filter((check) => check.state === "success").length;
  return { state: "passing", total, label: `${passed}/${total} checks passed` };
}
