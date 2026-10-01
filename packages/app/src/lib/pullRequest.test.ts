import { describe, expect, it } from "vitest";
import type { Checkout } from "@/types";
import { pullRequestOf } from "./pullRequest";

const agent = { aspect: "review" as const };
const none = { agent, checkout: undefined, shipped: undefined, workspacePr: undefined };
const live = (patch: Partial<NonNullable<Checkout["pr"]>> = {}): Checkout => ({
  access: "ready",
  pr: {
    number: 4,
    url: "https://gh/4",
    title: "Add refunds",
    merged: false,
    draft: false,
    conflicting: false,
    checks: [
      { id: "1", name: "build", state: "success", duration: "1m", url: null, workflow: null },
    ],
    ...patch,
  },
});

describe("pullRequestOf", () => {
  it("has no pull request until one is known", () => {
    expect(pullRequestOf(none)).toMatchObject({ phase: "none", number: null, access: "ready" });
  });

  it("reads an open PR from the poll, with its checks", () => {
    const view = pullRequestOf({ ...none, checkout: live() });
    expect(view).toMatchObject({
      phase: "open",
      number: 4,
      url: "https://gh/4",
      title: "Add refunds",
    });
    expect(view.summary.label).toBe("1/1 checks passed");
  });

  it("knows about a PR the app just opened before the poll catches up", () => {
    const view = pullRequestOf({ ...none, shipped: { number: 9, url: "u", merged: false } });
    expect(view).toMatchObject({ phase: "open", number: 9, url: "u" });
  });

  it("is merged when any source says so", () => {
    expect(pullRequestOf({ ...none, checkout: live({ merged: true }) }).phase).toBe("merged");
    expect(pullRequestOf({ ...none, shipped: { number: 1, url: "u", merged: true } }).phase).toBe(
      "merged",
    );
    expect(pullRequestOf({ ...none, workspacePr: { number: 2, merged: true } }).phase).toBe(
      "merged",
    );
    expect(pullRequestOf({ ...none, agent: { aspect: "merged" } }).phase).toBe("merged");
  });

  it("passes on what stops the forge from being reached", () => {
    expect(pullRequestOf({ ...none, checkout: { pr: null, access: "gh_missing" } }).access).toBe(
      "gh_missing",
    );
  });
});
