import { describe, expect, it } from "vitest";
import type { CheckoutPrStatusResponse } from "@interlock/protocol/messages";
import type { Message } from "@/types";
import {
  toCheckout,
  toPlanItems,
  toPullRequestStatus,
  toSetupRun,
  toShipped,
  toShipResult,
} from "./ship";

type PrStatus = NonNullable<CheckoutPrStatusResponse["payload"]["status"]>;

const status = (patch: Partial<PrStatus> = {}): PrStatus => ({
  forge: "github",
  number: 12,
  url: "https://github.com/o/r/pull/12",
  title: "Add refunds",
  state: "OPEN",
  baseRefName: "main",
  headRefName: "agent/x",
  isMerged: false,
  isDraft: false,
  mergeable: "MERGEABLE",
  checks: [
    {
      name: "build",
      status: "success",
      url: "https://ci/1",
      duration: "2m 4s",
      workflow: "CI",
      workflowRunId: 7,
      checkRunId: 8,
    },
    { name: "lint", status: "weird", url: null },
  ],
  forgeSpecific: undefined,
  ...patch,
});

describe("toPullRequestStatus", () => {
  it("maps the PR and its checks", () => {
    expect(toPullRequestStatus(status())).toEqual({
      number: 12,
      url: "https://github.com/o/r/pull/12",
      title: "Add refunds",
      merged: false,
      draft: false,
      conflicting: false,
      checks: [
        {
          id: "7:8:build",
          name: "build",
          state: "success",
          duration: "2m 4s",
          url: "https://ci/1",
          workflow: "CI",
        },
        { id: "::lint", name: "lint", state: "pending", duration: null, url: null, workflow: null },
      ],
    });
  });

  it("flags a conflicting PR and a merged one", () => {
    const result = toPullRequestStatus(status({ mergeable: "CONFLICTING", isMerged: true }));
    expect(result.conflicting).toBe(true);
    expect(result.merged).toBe(true);
  });
});

describe("toCheckout", () => {
  const response = (patch: Record<string, unknown>) =>
    ({
      cwd: "/wt",
      status: null,
      githubFeaturesEnabled: true,
      error: null,
      requestId: "r",
      forge: "github",
      ...patch,
    }) as Parameters<typeof toCheckout>[0];

  it("reads the PR and that the forge is reachable", () => {
    const checkout = toCheckout(response({ status: status(), authState: "authenticated" }));
    expect(checkout.access).toBe("ready");
    expect(checkout.pr?.number).toBe(12);
  });

  it.each([
    ["unauthenticated", "gh_unauthenticated"],
    ["cli_missing", "gh_missing"],
    ["no_remote", "no_remote"],
  ])("names what is in the way when the forge says %s", (authState, access) => {
    expect(toCheckout(response({ authState }))).toEqual({ pr: null, access });
  });
});

describe("toShipResult", () => {
  const base = { cwd: "/wt", requestId: "r", committed: true };

  it("returns the PR number and link", () => {
    expect(toShipResult({ ...base, number: 7, url: "u", error: null })).toEqual({
      ok: true,
      number: 7,
      url: "u",
    });
  });

  it("carries the daemon's error code", () => {
    const error = { code: "gh_unauthenticated" as const, message: "not logged in" };
    expect(toShipResult({ ...base, number: null, url: null, error })).toEqual({ ok: false, error });
  });
});

describe("toShipped", () => {
  it("reads a created and a merged PR", () => {
    expect(toShipped({ kind: "pr_created", cwd: "/wt", number: 3, url: "u" })).toEqual({
      number: 3,
      url: "u",
      merged: false,
    });
    expect(toShipped({ kind: "merged", cwd: "/wt", url: "u", archived: true })).toEqual({
      number: null,
      url: "u",
      merged: true,
    });
  });
});

describe("toSetupRun", () => {
  it("keeps the log and the outcome", () => {
    const detail = {
      type: "worktree_setup" as const,
      worktreePath: "/wt",
      branchName: "b",
      log: "npm i\n",
      commands: [],
    };
    expect(toSetupRun({ status: "failed", detail, error: "exit 1" })).toEqual({
      state: "failed",
      log: "npm i\n",
      error: "exit 1",
    });
  });
});

describe("toPlanItems", () => {
  const agent = (id: string, blocks: Extract<Message, { role: "agent" }>["blocks"]): Message => ({
    id,
    role: "agent",
    blocks,
    at: 0,
  });

  it("takes the steps of the last message that has a plan", () => {
    const messages: Message[] = [
      agent("a", [{ type: "step", text: "old", status: "completed" }]),
      { id: "u", role: "user", text: "go", at: 0 },
      agent("b", [
        { type: "text", text: "plan" },
        { type: "step", text: "Add test", status: "completed" },
        { type: "step", text: "Ship it", status: "in_progress" },
      ]),
      agent("c", [{ type: "text", text: "done" }]),
    ];
    expect(toPlanItems(messages)).toEqual([
      { text: "Add test", status: "completed" },
      { text: "Ship it", status: "in_progress" },
    ]);
  });

  it("is empty without a plan", () => {
    expect(toPlanItems([{ id: "u", role: "user", text: "hi", at: 0 }])).toEqual([]);
  });
});
