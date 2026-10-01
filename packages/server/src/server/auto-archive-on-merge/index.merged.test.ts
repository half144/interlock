import { resolve } from "node:path";
import type { Logger } from "pino";
import { expect, test, vi } from "vitest";

import { setupAutoArchiveOnMerge, type AutoArchiveOnMergeOptions } from "./index.js";
import type { WorkspaceGitRuntimeSnapshot } from "../workspace-git-service.js";

const PR_URL = "https://github.com/acme/repo/pull/12";

function snapshot(state: "open" | "merged"): WorkspaceGitRuntimeSnapshot {
  return {
    cwd: "/repo/worktree",
    git: { mainRepoRoot: "/repo" },
    forge: {
      pullRequest: {
        url: PR_URL,
        title: "Feature",
        state,
        baseRefName: "main",
        headRefName: "feature",
        isMerged: state === "merged",
      },
    },
  } as unknown as WorkspaceGitRuntimeSnapshot;
}

function setup(overrides: Partial<AutoArchiveOnMergeOptions>, archived: boolean) {
  let listener: ((next: WorkspaceGitRuntimeSnapshot) => void) | null = null;
  const archiveIfSafe = vi.fn(async () => archived);
  const merged = new Promise<{ cwd: string; url: string; archived: boolean }>((done) => {
    setupAutoArchiveOnMerge(
      {
        logger: { child: () => ({ warn: vi.fn() }) } as unknown as Logger,
        daemonConfigStore: { get: () => ({ autoArchiveAfterMerge: false }) },
        workspaceGitService: {
          onSnapshotUpdated: (next: (value: WorkspaceGitRuntimeSnapshot) => void) => {
            listener = next;
            return { unsubscribe: vi.fn() };
          },
          getSnapshot: async () => snapshot("merged"),
        },
        listActiveWorkspaces: async () => [{ workspaceId: "ws", cwd: "/repo/worktree" }],
        onMerged: done,
        ...overrides,
      } as unknown as AutoArchiveOnMergeOptions,
      { archiveIfSafe, resolvePath: resolve },
    );
  });
  if (!listener) throw new Error("listener missing");
  const emit = listener as (next: WorkspaceGitRuntimeSnapshot) => void;
  emit(snapshot("open"));
  emit(snapshot("merged"));
  return { merged, archiveIfSafe };
}

test("archives a merged task when its project asks for it, even if the daemon flag is off", async () => {
  const { merged, archiveIfSafe } = setup({ isArchiveEnabled: async () => true }, true);

  await expect(merged).resolves.toEqual({ cwd: "/repo/worktree", url: PR_URL, archived: true });
  expect(archiveIfSafe).toHaveBeenCalledTimes(1);
});

test("reports the merge without archiving when the project keeps merged worktrees", async () => {
  const { merged, archiveIfSafe } = setup({ isArchiveEnabled: async () => false }, true);

  await expect(merged).resolves.toEqual({ cwd: "/repo/worktree", url: PR_URL, archived: false });
  expect(archiveIfSafe).not.toHaveBeenCalled();
});

test("reports archived false when the worktree was not safe to archive", async () => {
  const { merged } = setup({ isArchiveEnabled: async () => true }, false);

  await expect(merged).resolves.toMatchObject({ archived: false });
});
