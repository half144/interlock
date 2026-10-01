import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Logger } from "pino";
import { describe, expect, test, vi } from "vitest";
import type { ArchiveDependencies } from "../../workspace-archive-service.js";
import { discardTask } from "./discard-task.js";
import { createRepoWithRemote, git, makeTempDir } from "./git-fixture.js";

function createTaskWorktree() {
  const { repo } = createRepoWithRemote();
  const worktreesRoot = makeTempDir("worktrees");
  const worktreePath = path.join(worktreesRoot, "hash1234", "abc123-fix-login");
  mkdirSync(path.dirname(worktreePath), { recursive: true });
  git(repo, "worktree", "add", "-b", "agent/abc123-fix-login", worktreePath);
  return { repo, worktreesRoot, worktreePath };
}

function archiveDeps(worktreesRoot: string): ArchiveDependencies {
  return {
    paseoHome: makeTempDir("home"),
    paseoWorktreesBaseRoot: worktreesRoot,
    github: {} as ArchiveDependencies["github"],
    workspaceGitService: { getSnapshot: vi.fn(async () => null) },
    agentManager: {
      listAgents: () => [],
      getAgent: () => null,
      archiveAgent: vi.fn(),
      archiveSnapshot: vi.fn(),
    },
    agentStorage: { listByWorkspace: async () => [] },
    findWorkspaceIdForCwd: async () => null,
    listActiveWorkspaces: async () => [],
    archiveWorkspaceRecord: vi.fn(async () => undefined),
    emitWorkspaceUpdatesForWorkspaceIds: vi.fn(async () => undefined),
    markWorkspaceArchiving: vi.fn(),
    clearWorkspaceArchiving: vi.fn(),
    killTerminalsForWorkspace: vi.fn(async () => undefined),
    sessionLogger: { warn: vi.fn(), info: vi.fn() } as unknown as Logger,
  };
}

describe("discardTask", () => {
  test("removes the worktree and deletes the local branch, leaving the remote alone", async () => {
    const { repo, worktreesRoot, worktreePath } = createTaskWorktree();
    git(worktreePath, "push", "-u", "origin", "agent/abc123-fix-login");

    const result = await discardTask(archiveDeps(worktreesRoot), {
      cwd: worktreePath,
      requestId: "r1",
    });

    expect(result).toEqual({ branchDeleted: true });
    expect(existsSync(worktreePath)).toBe(false);
    expect(git(repo, "branch", "--list", "agent/abc123-fix-login")).toBe("");
    expect(git(repo, "ls-remote", "--heads", "origin", "agent/abc123-fix-login")).not.toBe("");
  });

  test("is idempotent once the worktree is gone", async () => {
    const { worktreesRoot, worktreePath } = createTaskWorktree();
    const deps = archiveDeps(worktreesRoot);
    await discardTask(deps, { cwd: worktreePath, requestId: "r1" });

    await expect(discardTask(deps, { cwd: worktreePath, requestId: "r2" })).resolves.toEqual({
      branchDeleted: false,
    });
  });

  test("discards uncommitted work", async () => {
    const { worktreesRoot, worktreePath } = createTaskWorktree();
    writeFileSync(path.join(worktreePath, "wip.txt"), "unsaved\n");

    await discardTask(archiveDeps(worktreesRoot), { cwd: worktreePath, requestId: "r1" });

    expect(existsSync(worktreePath)).toBe(false);
  });

  test("refuses a directory that is not an Interlock worktree", async () => {
    const { repo, worktreesRoot } = createTaskWorktree();

    await expect(
      discardTask(archiveDeps(worktreesRoot), { cwd: repo, requestId: "r1" }),
    ).rejects.toThrow(/not a worktree created by Interlock/);
    expect(existsSync(repo)).toBe(true);
  });
});
