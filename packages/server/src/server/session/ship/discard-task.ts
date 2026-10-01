import { access } from "node:fs/promises";
import { getCurrentBranch, localBranchExists } from "../../../utils/checkout-git.js";
import { runGitCommand } from "../../../utils/run-git-command.js";
import { isPaseoOwnedWorktreeCwd } from "../../../utils/worktree.js";
import { archiveByScope, type ArchiveDependencies } from "../../workspace-archive-service.js";

const GIT_TIMEOUT_MS = 60_000;

async function pathExists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  );
}

/**
 * Stops the task's agents, removes its worktree and deletes the local branch.
 * Safe to repeat: a worktree that is already gone is a successful no-op.
 */
export async function discardTask(
  deps: ArchiveDependencies,
  input: { cwd: string; requestId: string },
): Promise<{ branchDeleted: boolean }> {
  const ownership = await isPaseoOwnedWorktreeCwd(input.cwd, {
    paseoHome: deps.paseoHome,
    worktreesRoot: deps.paseoWorktreesBaseRoot,
  });
  if (!ownership.allowed) {
    throw new Error(`Refusing to discard ${input.cwd}: it is not a worktree created by Interlock.`);
  }
  const worktreePath = ownership.worktreePath ?? input.cwd;
  const branch = (await pathExists(worktreePath)) ? await getCurrentBranch(worktreePath) : null;

  await archiveByScope(deps, {
    scope: { kind: "worktree", targetPath: worktreePath },
    requestId: input.requestId,
  });

  const repoRoot = ownership.repoRoot;
  if (!branch || branch === "HEAD" || !repoRoot || !(await localBranchExists(repoRoot, branch))) {
    return { branchDeleted: false };
  }
  await runGitCommand(["branch", "-D", branch], { cwd: repoRoot, timeout: GIT_TIMEOUT_MS });
  return { branchDeleted: true };
}
