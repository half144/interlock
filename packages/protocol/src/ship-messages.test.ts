import { expect, test } from "vitest";
import { SessionInboundMessageSchema, SessionOutboundMessageSchema } from "./messages.js";

test("accepts a create-PR request with plan items", () => {
  const parsed = SessionInboundMessageSchema.parse({
    type: "task_create_pr_request",
    cwd: "/wt/task",
    title: "Fix login",
    planItems: [{ text: "Add test", status: "in_progress" }],
    requestId: "r1",
  });
  expect(parsed.type).toBe("task_create_pr_request");
});

test("rejects a create-PR request without a title", () => {
  expect(
    SessionInboundMessageSchema.safeParse({
      type: "task_create_pr_request",
      cwd: "/wt/task",
      title: "",
      requestId: "r1",
    }).success,
  ).toBe(false);
});

test("accepts discard requests and responses", () => {
  expect(
    SessionInboundMessageSchema.safeParse({
      type: "task_discard_request",
      cwd: "/wt/task",
      requestId: "r2",
    }).success,
  ).toBe(true);
  expect(
    SessionOutboundMessageSchema.safeParse({
      type: "task_discard_response",
      payload: {
        cwd: "/wt/task",
        success: true,
        branchDeleted: false,
        error: null,
        requestId: "r2",
      },
    }).success,
  ).toBe(true);
});

test("create-PR errors carry a machine code and an actionable message", () => {
  const parsed = SessionOutboundMessageSchema.parse({
    type: "task_create_pr_response",
    payload: {
      cwd: "/wt/task",
      number: null,
      url: null,
      committed: false,
      error: { code: "no_remote", message: "Add an origin remote." },
      requestId: "r3",
    },
  });
  expect(parsed).toMatchObject({ payload: { error: { code: "no_remote" } } });
  expect(
    SessionOutboundMessageSchema.safeParse({
      type: "task_create_pr_response",
      payload: {
        cwd: "/wt/task",
        number: null,
        url: null,
        committed: false,
        error: { code: "made_up", message: "x" },
        requestId: "r3",
      },
    }).success,
  ).toBe(false);
});

test("task_ship_update distinguishes created and merged", () => {
  for (const payload of [
    { kind: "pr_created", cwd: "/wt/task", number: 7, url: "https://x/pull/7" },
    { kind: "merged", cwd: "/wt/task", url: "https://x/pull/7", archived: false },
  ]) {
    expect(
      SessionOutboundMessageSchema.safeParse({ type: "task_ship_update", payload }).success,
    ).toBe(true);
  }
});

test("branch-off worktree target no longer requires a branch name", () => {
  expect(
    SessionInboundMessageSchema.safeParse({
      type: "create_agent_request",
      requestId: "r4",
      config: { provider: "claude", cwd: "/repo" },
      worktree: { mode: "branch-off" },
    }).success,
  ).toBe(true);
});
