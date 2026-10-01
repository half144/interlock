import { describe, expect, it } from "vitest";
import type { WorkspaceDescriptorPayload } from "@interlock/protocol/messages";
import { addProjectFailure, pullRequestOf, toProject, toWorkspace } from "./projects";

const workspace = (
  patch: Partial<WorkspaceDescriptorPayload> = {},
): WorkspaceDescriptorPayload => ({
  id: "w1",
  projectId: "p1",
  projectDisplayName: "repo",
  projectRootPath: "/r",
  workspaceDirectory: "/r/wt",
  projectKind: "git",
  workspaceKind: "worktree",
  name: "amiable-spider",
  archivingAt: null,
  status: "done",
  statusEnteredAt: null,
  activityAt: null,
  diffStat: { additions: 4, deletions: 2 },
  scripts: [],
  gitRuntime: { currentBranch: "amiable-spider" },
  githubRuntime: null,
  ...patch,
});

describe("toProject", () => {
  it("fills the real fields and default settings", () => {
    const project = toProject(
      { projectId: "p1", projectDisplayName: "repo", projectRootPath: "/r", projectKind: "git" },
      { remoteUrl: "git@github.com:a/b.git" },
    );
    expect(project).toMatchObject({
      id: "p1",
      name: "repo",
      rootPath: "/r",
      remoteUrl: "git@github.com:a/b.git",
      defaultBranch: "main",
      settings: { autonomy: "auto", archiveAfterMerge: true, env: [] },
    });
  });
});

describe("toWorkspace", () => {
  it("reads branch, diff stat and worktree kind", () => {
    expect(toWorkspace(workspace())).toEqual({
      id: "w1",
      projectId: "p1",
      directory: "/r/wt",
      name: "amiable-spider",
      branch: "amiable-spider",
      remoteUrl: null,
      isWorktree: true,
      additions: 4,
      deletions: 2,
    });
    expect(
      toWorkspace(workspace({ gitRuntime: null, diffStat: null, workspaceKind: "checkout" })),
    ).toMatchObject({
      branch: null,
      isWorktree: false,
      additions: 0,
    });
  });
});

describe("pullRequestOf", () => {
  it("reports number and merge state", () => {
    expect(pullRequestOf(workspace())).toBeNull();
    const withPr = workspace({
      githubRuntime: {
        pullRequest: {
          number: 7,
          url: "u",
          title: "t",
          state: "MERGED",
          baseRefName: "main",
          headRefName: "x",
          isMerged: true,
        },
      },
    });
    expect(pullRequestOf(withPr)).toEqual({ number: 7, merged: true });
  });
});

describe("addProjectFailure", () => {
  it("explains why a folder without git cannot be a project", () => {
    expect(addProjectFailure({ error: "x", errorCode: "not_a_git_repo" })).toContain("git init");
  });

  it("explains a missing folder", () => {
    expect(addProjectFailure({ error: "x", errorCode: "directory_not_found" })).toContain(
      "does not exist",
    );
  });

  it("falls back to the daemon's own message", () => {
    expect(addProjectFailure({ error: "disk full" })).toBe("disk full");
  });
});
