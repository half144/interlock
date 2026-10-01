import type { TaskPlanItem } from "@interlock/protocol/messages";
import { ForgeCommandError } from "../../../services/forge-cli-command.js";
import type { ForgeService } from "../../../services/forge-service.js";
import {
  commitChanges,
  getCurrentBranch,
  hasOriginRemote,
  listCheckoutCommits,
} from "../../../utils/checkout-git.js";
import { runGitCommand } from "../../../utils/run-git-command.js";
import { buildTaskPrBody } from "./pr-body.js";
import { CommitFailedError, NoRemoteError, PushRejectedError } from "./ship-errors.js";

const GIT_TIMEOUT_MS = 120_000;
const PUSH_REJECTED_PATTERN =
  /rejected|non-fast-forward|fetch first|protected branch|permission denied|denied to|403/i;

export interface CreateTaskPrInput {
  cwd: string;
  title: string;
  planItems: readonly TaskPlanItem[];
  baseRef: string | undefined;
}

export interface CreateTaskPrDeps {
  resolveForgeService(cwd: string): Promise<ForgeService | null>;
}

export interface CreateTaskPrResult {
  number: number;
  url: string;
  committed: boolean;
}

function errorDetail(error: unknown): string {
  if (error instanceof Error && "stderr" in error && typeof error.stderr === "string") {
    return error.stderr.trim();
  }
  return error instanceof Error ? error.message : String(error);
}

async function commitIfDirty(cwd: string, title: string): Promise<boolean> {
  const { stdout } = await runGitCommand(["status", "--porcelain"], {
    cwd,
    timeout: GIT_TIMEOUT_MS,
  });
  if (stdout.trim().length === 0) {
    return false;
  }
  try {
    await commitChanges(cwd, { message: title, addAll: true });
  } catch (error) {
    throw new CommitFailedError(errorDetail(error));
  }
  return true;
}

async function pushBranch(cwd: string, branch: string): Promise<void> {
  try {
    await runGitCommand(["push", "-u", "origin", branch], { cwd, timeout: GIT_TIMEOUT_MS });
  } catch (error) {
    const detail = errorDetail(error);
    if (PUSH_REJECTED_PATTERN.test(detail)) {
      throw new PushRejectedError(branch, detail);
    }
    throw new Error(`git push failed: ${detail}`);
  }
}

function stripRemotePrefix(ref: string): string {
  return ref.replace(/^refs\/remotes\/origin\//, "").replace(/^origin\//, "");
}

export async function createTaskPullRequest(
  deps: CreateTaskPrDeps,
  input: CreateTaskPrInput,
): Promise<CreateTaskPrResult> {
  const { cwd, title } = input;
  const service = await deps.resolveForgeService(cwd);
  if (!service) {
    throw new NoRemoteError(await hasOriginRemote(cwd));
  }
  const head = await getCurrentBranch(cwd);
  if (!head || head === "HEAD") {
    throw new Error("The task's worktree is not on a branch, so a pull request cannot be created.");
  }

  const committed = await commitIfDirty(cwd, title);
  await pushBranch(cwd, head);

  const { baseRef, commits } = await listCheckoutCommits({ cwd });
  const resolvedBase = input.baseRef ?? baseRef;
  if (!resolvedBase) {
    throw new Error("Could not determine the base branch for the pull request.");
  }

  try {
    const created = await service.createPullRequest({
      cwd,
      title,
      body: buildTaskPrBody({ title, planItems: input.planItems, commits }),
      head,
      base: stripRemotePrefix(resolvedBase),
    });
    return { number: created.number, url: created.url, committed };
  } catch (error) {
    if (error instanceof ForgeCommandError && /already exists/i.test(error.stderr)) {
      const existing = await service.getCurrentPullRequestStatus({ cwd, headRef: head });
      if (existing?.number !== undefined) {
        return { number: existing.number, url: existing.url, committed };
      }
    }
    throw error;
  } finally {
    service.invalidate({ cwd });
  }
}
