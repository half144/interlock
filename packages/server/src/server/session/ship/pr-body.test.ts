import { expect, test } from "vitest";
import type { CheckoutCommit } from "@interlock/protocol/messages";
import { buildTaskPrBody } from "./pr-body.js";

function commit(overrides: Partial<CheckoutCommit>): CheckoutCommit {
  return {
    sha: "a".repeat(40),
    shortSha: "aaaaaaa",
    subject: "Do a thing",
    authorName: "A",
    authorDate: "2026-10-01T00:00:00Z",
    isOnRemote: false,
    isOnBase: false,
    files: [],
    ...overrides,
  } as CheckoutCommit;
}

test("summarizes title, plan items and what changed", () => {
  const body = buildTaskPrBody({
    title: "Fix login",
    planItems: [
      { text: "Reproduce", status: "completed" },
      { text: "Patch redirect", status: "in_progress" },
      { text: "Add test", status: "pending" },
    ],
    commits: [
      commit({
        subject: "Patch redirect",
        files: [
          { path: "src/login.ts", additions: 5, deletions: 2, status: "modified" },
          { path: "src/login.test.ts", additions: 20, deletions: 0, status: "added" },
        ],
      }),
      commit({
        sha: "b".repeat(40),
        shortSha: "bbbbbbb",
        subject: "Tidy",
        files: [{ path: "src/login.ts", additions: 1, deletions: 1, status: "modified" }],
      }),
      commit({ subject: "Base commit", isOnBase: true }),
    ],
  });

  expect(body).toContain("## Fix login");
  expect(body).toContain("- [x] Reproduce");
  expect(body).toContain("- [ ] Patch redirect (in progress)");
  expect(body).toContain("- [ ] Add test");
  expect(body).toContain("2 files across 2 commits.");
  expect(body).toContain("`src/login.ts` +6 -3");
  expect(body).not.toContain("Base commit");
});

test("omits empty sections", () => {
  const body = buildTaskPrBody({ title: "Only a title", planItems: [], commits: [] });
  expect(body).not.toContain("### Plan");
  expect(body).not.toContain("### What changed");
});
