import { MAX_SLUG_LENGTH, slugify } from "@interlock/protocol/branch-slug";

const TASK_BRANCH_PREFIX = "agent/";
const TASK_ID_LENGTH = 6;
const MAX_BRANCH_LENGTH = 100;
const TASK_BRANCH_ID_PATTERN = /^agent\/[a-z0-9]+-/;

function trimHyphens(value: string): string {
  return value.replace(/^-+|-+$/g, "");
}

/** The branch a task starts on, before the AI-generated name replaces its slug: `agent/<id>-<slug>`. */
export function buildProvisionalTaskNames(input: { agentId: string; promptTitle: string | null }): {
  worktreeSlug: string;
  branchName: string;
} {
  const id = input.agentId
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, TASK_ID_LENGTH);
  const slug = slugify(input.promptTitle ?? "") || "task";
  const worktreeSlug = trimHyphens(`${id}-${slug}`.slice(0, MAX_SLUG_LENGTH));
  return { worktreeSlug, branchName: `${TASK_BRANCH_PREFIX}${worktreeSlug}` };
}

/** Keeps the `agent/<id>-` prefix of a task's placeholder branch on its generated name. */
export function keepTaskBranchPrefix(placeholderBranch: string | null, generated: string): string {
  const prefix = TASK_BRANCH_ID_PATTERN.exec(placeholderBranch ?? "")?.[0];
  if (!prefix) {
    return generated;
  }
  const slug = slugify(generated.replace(/^agent\//, ""));
  return trimHyphens(`${prefix}${slug}`.slice(0, MAX_BRANCH_LENGTH));
}
