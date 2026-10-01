import type {
  CheckoutPrStatusResponse,
  TaskCreatePrResponse,
  TaskPlanItem,
  TaskShipUpdateMessage,
  WorkspaceSetupSnapshot,
} from "@interlock/protocol/messages";
import type {
  Checkout,
  ForgeAccess,
  Message,
  PullRequestStatus,
  SetupRun,
  ShipError,
  ShippedPullRequest,
} from "@/types";

type PrStatusResponse = CheckoutPrStatusResponse["payload"];
type PrStatusPayload = NonNullable<PrStatusResponse["status"]>;

const ACCESS: Record<string, ForgeAccess> = {
  unauthenticated: "gh_unauthenticated",
  cli_missing: "gh_missing",
  no_remote: "no_remote",
};

export type ShipResult =
  | { ok: true; number: number | null; url: string | null }
  | { ok: false; error: ShipError };

const CHECK_STATES = ["pending", "success", "failure", "cancelled", "skipped"] as const;

const toCheckState = (status: string) =>
  CHECK_STATES.find((state) => state === status) ?? "pending";

export function toPullRequestStatus(status: PrStatusPayload): PullRequestStatus {
  return {
    number: status.number ?? null,
    url: status.url,
    title: status.title,
    merged: status.isMerged,
    draft: status.isDraft,
    conflicting: status.mergeable === "CONFLICTING",
    checks: status.checks.map((check) => ({
      id: [check.workflowRunId, check.checkRunId, check.name].join(":"),
      name: check.name,
      state: toCheckState(check.status),
      duration: check.duration ?? null,
      url: check.url,
      workflow: check.workflow ?? null,
    })),
  };
}

export function toCheckout(response: PrStatusResponse): Checkout {
  return {
    pr: response.status ? toPullRequestStatus(response.status) : null,
    access:
      (typeof response.authState === "string" ? ACCESS[response.authState] : undefined) ?? "ready",
  };
}

export function toShipResult(payload: TaskCreatePrResponse["payload"]): ShipResult {
  if (payload.error) return { ok: false, error: payload.error };
  return { ok: true, number: payload.number, url: payload.url };
}

export function toShipped(update: TaskShipUpdateMessage["payload"]): ShippedPullRequest {
  return update.kind === "merged"
    ? { number: null, url: update.url, merged: true }
    : { number: update.number, url: update.url, merged: false };
}

export function toSetupRun(snapshot: WorkspaceSetupSnapshot): SetupRun {
  return { state: snapshot.status, log: snapshot.detail.log, error: snapshot.error };
}

/** The plan the agent last reported, which the daemon turns into the PR body. */
export function toPlanItems(messages: Message[]): TaskPlanItem[] {
  const planned = messages.findLast(
    (m) => m.role === "agent" && m.blocks.some((b) => b.type === "step"),
  );
  if (planned?.role !== "agent") return [];
  return planned.blocks.flatMap((block) =>
    block.type === "step" ? [{ text: block.text, status: block.status }] : [],
  );
}
