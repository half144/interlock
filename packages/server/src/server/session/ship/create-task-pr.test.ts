import { writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";
import { ForgeCommandError } from "../../../services/forge-cli-command.js";
import type { ForgeService } from "../../../services/forge-service.js";
import { createTaskPullRequest } from "./create-task-pr.js";
import { createRepoWithRemote, git, makeTempDir } from "./git-fixture.js";
import { NoRemoteError, PushRejectedError } from "./ship-errors.js";

function fakeForge(overrides: Partial<ForgeService> = {}): ForgeService {
  return {
    createPullRequest: vi.fn(async () => ({
      number: 12,
      url: "https://github.com/acme/repo/pull/12",
    })),
    getCurrentPullRequestStatus: vi.fn(async () => null),
    invalidate: vi.fn(),
    ...overrides,
  } as unknown as ForgeService;
}

function taskBranch(repo: string): void {
  git(repo, "checkout", "-b", "agent/abc123-fix-login");
}

describe("createTaskPullRequest", () => {
  test("commits a dirty worktree with the task title, pushes with upstream and opens the PR", async () => {
    const { repo, remote } = createRepoWithRemote();
    taskBranch(repo);
    writeFileSync(path.join(repo, "login.ts"), "export const login = 1;\n");
    const service = fakeForge();

    const result = await createTaskPullRequest(
      { resolveForgeService: async () => service },
      {
        cwd: repo,
        title: "Fix login redirect",
        planItems: [{ text: "Add regression test", status: "completed" }],
        baseRef: undefined,
      },
    );

    expect(result).toEqual({
      number: 12,
      url: "https://github.com/acme/repo/pull/12",
      committed: true,
    });
    expect(git(repo, "log", "-1", "--format=%s")).toBe("Fix login redirect");
    expect(git(repo, "status", "--porcelain")).toBe("");
    expect(git(remote, "rev-parse", "agent/abc123-fix-login")).toBe(git(repo, "rev-parse", "HEAD"));
    expect(git(repo, "rev-parse", "--abbrev-ref", "@{upstream}")).toBe(
      "origin/agent/abc123-fix-login",
    );

    const call = vi.mocked(service.createPullRequest).mock.calls[0]?.[0];
    expect(call).toMatchObject({
      title: "Fix login redirect",
      head: "agent/abc123-fix-login",
      base: "main",
    });
    expect(call?.body).toContain("- [x] Add regression test");
    expect(call?.body).toContain("`login.ts`");
    expect(call?.body).toContain("Fix login redirect");
  });

  test("does not commit when the worktree is clean", async () => {
    const { repo } = createRepoWithRemote();
    taskBranch(repo);
    writeFileSync(path.join(repo, "a.txt"), "a\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-m", "agent work");

    const result = await createTaskPullRequest(
      { resolveForgeService: async () => fakeForge() },
      { cwd: repo, title: "Task", planItems: [], baseRef: undefined },
    );

    expect(result.committed).toBe(false);
    expect(git(repo, "log", "-1", "--format=%s")).toBe("agent work");
  });

  test("reports a missing origin remote before touching the worktree", async () => {
    const repo = makeTempDir("noremote");
    git(repo, "init", "--initial-branch=main");
    writeFileSync(path.join(repo, "a.txt"), "a\n");

    await expect(
      createTaskPullRequest(
        { resolveForgeService: async () => null },
        { cwd: repo, title: "Task", planItems: [], baseRef: undefined },
      ),
    ).rejects.toBeInstanceOf(NoRemoteError);
    expect(git(repo, "status", "--porcelain")).toContain("a.txt");
  });

  test("reports a rejected push", async () => {
    const { repo, remote } = createRepoWithRemote();
    taskBranch(repo);
    writeFileSync(path.join(repo, "a.txt"), "a\n");
    git(repo, "add", "-A");
    git(repo, "commit", "-m", "mine");
    const other = makeTempDir("other");
    git(other, "clone", remote, "clone");
    const clone = path.join(other, "clone");
    git(clone, "checkout", "-b", "agent/abc123-fix-login");
    writeFileSync(path.join(clone, "b.txt"), "b\n");
    git(clone, "add", "-A");
    git(clone, "commit", "-m", "theirs");
    git(clone, "push", "origin", "agent/abc123-fix-login");

    await expect(
      createTaskPullRequest(
        { resolveForgeService: async () => fakeForge() },
        { cwd: repo, title: "Task", planItems: [], baseRef: undefined },
      ),
    ).rejects.toBeInstanceOf(PushRejectedError);
  });

  test("returns the existing PR when GitHub says one already exists", async () => {
    const { repo } = createRepoWithRemote();
    taskBranch(repo);
    writeFileSync(path.join(repo, "a.txt"), "a\n");
    const service = fakeForge({
      createPullRequest: vi.fn(async () => {
        throw new ForgeCommandError(
          { brand: "GitHub", binary: "gh" },
          {
            args: ["api"],
            cwd: repo,
            exitCode: 1,
            stderr: "A pull request already exists for acme:agent/abc123-fix-login",
          },
        );
      }),
      getCurrentPullRequestStatus: vi.fn(async () => ({
        number: 5,
        url: "https://github.com/acme/repo/pull/5",
      })),
    } as Partial<ForgeService>);

    const result = await createTaskPullRequest(
      { resolveForgeService: async () => service },
      { cwd: repo, title: "Task", planItems: [], baseRef: undefined },
    );

    expect(result).toMatchObject({ number: 5, url: "https://github.com/acme/repo/pull/5" });
  });
});
