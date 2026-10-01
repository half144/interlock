import type { DaemonClient } from "@interlock/client/internal/daemon-client";

/** The branch a repository sits on when it is added, which is the one new tasks branch off by default. */
export async function checkedOutBranch(
  client: DaemonClient,
  rootPath: string,
): Promise<string | undefined> {
  try {
    const status = await client.getCheckoutStatus(rootPath);
    return status.currentBranch ?? undefined;
  } catch (error) {
    console.error(`Could not read the branch of ${rootPath}`, error);
    return undefined;
  }
}

const BRANCH_LIMIT = 30;

/** Branches a new worktree can start from, matching the query, most recently used first. */
export async function startingBranches(
  client: DaemonClient,
  cwd: string,
  query: string,
): Promise<string[]> {
  const result = await client.getBranchSuggestions({
    cwd,
    limit: BRANCH_LIMIT,
    ...(query ? { query } : {}),
  });
  if (result.error) throw new Error(result.error);
  return result.branches;
}
