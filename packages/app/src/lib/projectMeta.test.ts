import { describe, expect, it } from "vitest";
import type { Project, Workspace } from "@/types";
import { withProjectMeta } from "./projectMeta";

const project = { id: "p", defaultBranch: "main", remoteUrl: null } as Project;
const workspace = (patch: Partial<Workspace>) =>
  ({
    id: "w",
    projectId: "p",
    isWorktree: false,
    branch: null,
    remoteUrl: null,
    ...patch,
  }) as Workspace;

describe("withProjectMeta", () => {
  it("takes the remote and default branch from the project's workspaces", () => {
    const result = withProjectMeta(
      { p: project },
      {
        a: workspace({ id: "a", branch: "develop", remoteUrl: "git@github.com:me/app.git" }),
        b: workspace({ id: "b", isWorktree: true, branch: "task-1" }),
      },
    );
    expect(result["p"]).toMatchObject({
      defaultBranch: "develop",
      remoteUrl: "git@github.com:me/app.git",
    });
  });

  it("keeps what it has when no workspace says otherwise", () => {
    expect(withProjectMeta({ p: project }, {})["p"]).toEqual(project);
  });
});
