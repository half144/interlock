import { beforeEach, describe, expect, it } from "vitest";
import type { Project, Workspace } from "@/types";
import { useStore } from "../app-store";

const project = (patch: Partial<Project> = {}): Project => ({
  id: "p",
  name: "repo",
  rootPath: "/repo",
  remoteUrl: null,
  defaultBranch: "main",
  settings: {
    setupCommands: [],
    env: [],
    filesToCopy: [],
    autonomy: "auto",
    defaultKind: null,
    defaultModel: null,
    archiveAfterMerge: true,
    defaultBranch: null,
  },
  ...patch,
});

const workspace = (patch: Partial<Workspace>): Workspace => ({
  id: "w",
  projectId: "p",
  directory: "/repo",
  name: "repo",
  branch: "develop",
  remoteUrl: "git@github.com:me/repo.git",
  isWorktree: false,
  additions: 0,
  deletions: 0,
  ...patch,
});

describe("project slice", () => {
  beforeEach(() => useStore.setState({ projects: {}, workspaces: {}, pullRequests: {} }));

  it("keeps the settings and the default branch a project already has when the daemon updates it", () => {
    const { upsertProject } = useStore.getState();
    upsertProject(
      project({
        defaultBranch: "develop",
        settings: { ...project().settings, setupCommands: ["npm i"] },
      }),
    );
    upsertProject(project({ name: "renamed" }));
    expect(useStore.getState().projects["p"]).toMatchObject({
      name: "renamed",
      defaultBranch: "develop",
      settings: { setupCommands: ["npm i"] },
    });
  });

  it("reads the remote and default branch from the main checkout workspace", () => {
    const state = useStore.getState();
    state.replaceProjects([project()]);
    state.replaceWorkspaces([{ workspace: workspace({}), pr: null }]);
    expect(useStore.getState().projects["p"]).toMatchObject({
      defaultBranch: "develop",
      remoteUrl: "git@github.com:me/repo.git",
    });
  });

  it("keeps the branch picked in settings over the branch the main checkout sits on", () => {
    const state = useStore.getState();
    state.replaceProjects([
      project({
        defaultBranch: "release",
        settings: { ...project().settings, defaultBranch: "release" },
      }),
    ]);
    state.replaceWorkspaces([{ workspace: workspace({}), pr: null }]);
    expect(useStore.getState().projects["p"]?.defaultBranch).toBe("release");
  });

  it("tracks the pull request of a workspace and forgets it with the workspace", () => {
    const state = useStore.getState();
    state.upsertWorkspace(workspace({ isWorktree: true }), { number: 7, merged: false });
    expect(useStore.getState().pullRequests["w"]).toEqual({ number: 7, merged: false });
    state.removeWorkspace("w");
    expect(useStore.getState().pullRequests).toEqual({});
  });
});
