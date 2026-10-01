import type { Logger } from "pino";
import { expect, test, vi } from "vitest";
import type { WorkspaceGitRuntimeSnapshot } from "../../workspace-git-service.js";
import { createArchiveAfterMergeReader } from "./archive-after-merge.js";

const logger = { warn: vi.fn() } as unknown as Logger;

function snapshot(mainRepoRoot: string | null): WorkspaceGitRuntimeSnapshot {
  return {
    cwd: "/worktrees/task",
    git: { repoRoot: "/worktrees/task", mainRepoRoot },
  } as unknown as WorkspaceGitRuntimeSnapshot;
}

test("reads the setting of the project that owns the worktree", async () => {
  const get = vi.fn(async () => ({ archiveAfterMerge: false }));
  const read = createArchiveAfterMergeReader({ get }, logger);

  await expect(read(snapshot("/repo"))).resolves.toBe(false);
  expect(get).toHaveBeenCalledWith("/repo");
});

test("archives by default when the settings cannot be read", async () => {
  const read = createArchiveAfterMergeReader(
    {
      get: async () => {
        throw new Error("corrupt");
      },
    },
    logger,
  );

  await expect(read(snapshot("/repo"))).resolves.toBe(true);
});
