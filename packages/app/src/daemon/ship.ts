import { getClient } from "./client";
import { toShipResult, type ShipResult } from "./adapters/ship";
import type { TaskPlanItem } from "@interlock/protocol/messages";

export interface CreatePrInput {
  cwd: string;
  title: string;
  planItems: TaskPlanItem[];
  baseRef: string;
}

/** Commits what is left, pushes the branch and opens the pull request with `gh`. */
export async function createPullRequest(input: CreatePrInput): Promise<ShipResult> {
  const payload = await getClient().createTaskPr({
    cwd: input.cwd,
    title: input.title,
    baseRef: input.baseRef,
    ...(input.planItems.length ? { planItems: input.planItems } : {}),
  });
  return toShipResult(payload);
}
