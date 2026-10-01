import { resolve } from "node:path";
import { LRUCache } from "lru-cache";
import type { Logger } from "pino";

import { archiveIfSafe, type AutoArchiveArchiveOptions } from "./archive-if-safe.js";
import type {
  WorkspaceGitRuntimeSnapshot,
  WorkspaceGitSubscription,
} from "../workspace-git-service.js";

export interface AutoArchiveOnMergeOptions extends AutoArchiveArchiveOptions {
  logger: Logger;
  /** Per-project override of the daemon-wide `autoArchiveAfterMerge` flag. */
  isArchiveEnabled?: (snapshot: WorkspaceGitRuntimeSnapshot) => Promise<boolean>;
  onMerged?: (merged: { cwd: string; url: string; archived: boolean }) => void;
}

export interface AutoArchiveOnMergeDependencies {
  archiveIfSafe: typeof archiveIfSafe;
  resolvePath: typeof resolve;
}

const OPEN_PULL_REQUEST_LATCH_MAX = 1_024;

const defaultDependencies: AutoArchiveOnMergeDependencies = {
  archiveIfSafe,
  resolvePath: resolve,
};

function isArchiveEnabled(
  options: AutoArchiveOnMergeOptions,
  snapshot: WorkspaceGitRuntimeSnapshot,
): Promise<boolean> | boolean {
  return options.isArchiveEnabled
    ? options.isArchiveEnabled(snapshot)
    : options.daemonConfigStore.get().autoArchiveAfterMerge === true;
}

async function archiveAttachedWorkspaces(input: {
  options: AutoArchiveOnMergeOptions;
  deps: AutoArchiveOnMergeDependencies;
  log: Logger;
  snapshotCwd: string;
  freshSnapshot: WorkspaceGitRuntimeSnapshot;
}): Promise<boolean> {
  const { options, deps, log, snapshotCwd, freshSnapshot } = input;
  const attachedWorkspaces = (await options.listActiveWorkspaces()).filter(
    (workspace) => deps.resolvePath(workspace.cwd) === snapshotCwd,
  );
  let archived = false;
  for (const workspace of attachedWorkspaces) {
    const archivedWorkspace = await deps.archiveIfSafe({
      workspaceId: workspace.workspaceId,
      snapshot: freshSnapshot,
      options,
      log,
    });
    archived ||= archivedWorkspace;
  }
  return archived;
}

export function setupAutoArchiveOnMerge(
  options: AutoArchiveOnMergeOptions,
  deps: AutoArchiveOnMergeDependencies = defaultDependencies,
): WorkspaceGitSubscription {
  const log = options.logger.child({ module: "auto-archive-on-merge" });
  const inFlightCwds = new Set<string>();
  const openPullRequestUrlsByCwd = new LRUCache<string, string>({
    max: OPEN_PULL_REQUEST_LATCH_MAX,
  });
  const notifiedMergeUrlsByCwd = new LRUCache<string, string>({
    max: OPEN_PULL_REQUEST_LATCH_MAX,
  });

  return options.workspaceGitService.onSnapshotUpdated((snapshot) => {
    const snapshotCwd = deps.resolvePath(snapshot.cwd);
    const pullRequest = snapshot.forge.pullRequest;
    if (!pullRequest?.isMerged) {
      if (pullRequest?.state.toLowerCase() === "open") {
        openPullRequestUrlsByCwd.set(snapshotCwd, pullRequest.url);
      } else {
        openPullRequestUrlsByCwd.delete(snapshotCwd);
      }
      return;
    }
    if (openPullRequestUrlsByCwd.get(snapshotCwd) !== pullRequest.url) {
      openPullRequestUrlsByCwd.delete(snapshotCwd);
      return;
    }
    if (inFlightCwds.has(snapshotCwd)) {
      return;
    }
    inFlightCwds.add(snapshotCwd);

    void (async () => {
      let freshSnapshot: WorkspaceGitRuntimeSnapshot | null;
      try {
        freshSnapshot = await options.workspaceGitService.getSnapshot(snapshot.cwd, {
          reason: "auto-archive-on-merge",
        });
      } catch (error) {
        log.warn(
          { err: error, cwd: snapshot.cwd },
          "Failed to read snapshot for auto-archive; skipping",
        );
        return;
      }
      const freshPullRequest = freshSnapshot?.forge.pullRequest;
      if (
        !freshPullRequest?.isMerged ||
        freshPullRequest.url !== pullRequest.url ||
        openPullRequestUrlsByCwd.get(snapshotCwd) !== pullRequest.url
      ) {
        if (openPullRequestUrlsByCwd.get(snapshotCwd) === pullRequest.url) {
          openPullRequestUrlsByCwd.delete(snapshotCwd);
        }
        return;
      }

      const archiveEnabled = await isArchiveEnabled(options, freshSnapshot);
      const archived = archiveEnabled
        ? await archiveAttachedWorkspaces({ options, deps, log, snapshotCwd, freshSnapshot })
        : false;
      if (!archiveEnabled) {
        openPullRequestUrlsByCwd.delete(snapshotCwd);
      }
      if (notifiedMergeUrlsByCwd.get(snapshotCwd) !== freshPullRequest.url) {
        notifiedMergeUrlsByCwd.set(snapshotCwd, freshPullRequest.url);
        options.onMerged?.({ cwd: snapshot.cwd, url: freshPullRequest.url, archived });
      }
    })()
      .catch((error) => {
        log.warn({ err: error, cwd: snapshot.cwd }, "Failed to auto-archive attached workspaces");
      })
      .finally(() => {
        inFlightCwds.delete(snapshotCwd);
      });
  });
}
