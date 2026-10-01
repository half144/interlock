import { describe, expect, it } from "vitest";
import { inspectGitProject } from "./project-git-info.js";

describe("inspectGitProject", () => {
  it("returns the default branch and the remote of a git repo", async () => {
    const info = await inspectGitProject("/repo", {
      getCheckout: async () => ({
        isGit: true,
        remoteUrl: "git@github.com:acme/app.git",
      }),
      resolveDefaultBranch: async () => "main",
    });

    expect(info).toEqual({
      defaultBranch: "main",
      remoteName: "origin",
      remoteUrl: "git@github.com:acme/app.git",
    });
  });

  it("reports no remote and an unknown branch without failing", async () => {
    const info = await inspectGitProject("/repo", {
      getCheckout: async () => ({ isGit: true, remoteUrl: null }),
      resolveDefaultBranch: async () => {
        throw new Error("Unable to resolve repository default branch");
      },
    });

    expect(info).toEqual({
      defaultBranch: null,
      remoteName: null,
      remoteUrl: null,
    });
  });

  it("returns null for a folder that is not a git repository", async () => {
    const info = await inspectGitProject("/plain", {
      getCheckout: async () => ({ isGit: false, remoteUrl: null }),
      resolveDefaultBranch: async () => "main",
    });

    expect(info).toBeNull();
  });
});
