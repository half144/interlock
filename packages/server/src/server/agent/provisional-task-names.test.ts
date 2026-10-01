import { expect, test } from "vitest";
import { validateBranchSlug } from "@interlock/protocol/branch-slug";
import { buildProvisionalTaskNames, keepTaskBranchPrefix } from "./provisional-task-names.js";

test("starts a task on agent/<id>-<slug> built from the prompt", () => {
  const names = buildProvisionalTaskNames({
    agentId: "4f9c2a1e-7b6d-4c3a-9e1f-0a2b3c4d5e6f",
    promptTitle: "Fix the login redirect loop!",
  });

  expect(names).toEqual({
    worktreeSlug: "4f9c2a-fix-the-login-redirect-loop",
    branchName: "agent/4f9c2a-fix-the-login-redirect-loop",
  });
  expect(validateBranchSlug(names.branchName).valid).toBe(true);
});

test("falls back to a generic slug and keeps long prompts within the limit", () => {
  expect(buildProvisionalTaskNames({ agentId: "abcdef12", promptTitle: null }).branchName).toBe(
    "agent/abcdef-task",
  );
  expect(buildProvisionalTaskNames({ agentId: "abcdef12", promptTitle: "!!!" }).branchName).toBe(
    "agent/abcdef-task",
  );
  const long = buildProvisionalTaskNames({
    agentId: "abcdef12",
    promptTitle: "word ".repeat(40),
  });
  expect(long.worktreeSlug.length).toBeLessThanOrEqual(50);
  expect(validateBranchSlug(long.branchName).valid).toBe(true);
});

test("keeps the agent/<id>- prefix on the generated branch name", () => {
  expect(keepTaskBranchPrefix("agent/4f9c2a-fix-the-login", "fix-login-redirect-loop")).toBe(
    "agent/4f9c2a-fix-login-redirect-loop",
  );
  expect(keepTaskBranchPrefix("agent/4f9c2a-fix-the-login", "agent/fix-login")).toBe(
    "agent/4f9c2a-fix-login",
  );
});

test("leaves the generated name alone when the placeholder is not a task branch", () => {
  expect(keepTaskBranchPrefix("calm-otter", "fix-login")).toBe("fix-login");
  expect(keepTaskBranchPrefix(null, "fix-login")).toBe("fix-login");
});
