import { describe, expect, it } from "vitest";
import { toPatch, toProjectSettings } from "./projectSettings";

describe("toProjectSettings", () => {
  it("turns the daemon's record and names into the app's shape", () => {
    expect(
      toProjectSettings({
        setupCommands: ["npm ci"],
        env: { A: "1", B: "2" },
        copyFiles: [".env"],
        autonomy: "full-auto",
        defaultProvider: "codex",
        defaultModel: "gpt-5",
        archiveAfterMerge: false,
        defaultBranch: "develop",
      }),
    ).toEqual({
      setupCommands: ["npm ci"],
      env: [
        ["A", "1"],
        ["B", "2"],
      ],
      filesToCopy: [".env"],
      autonomy: "full-auto",
      defaultKind: "codex",
      defaultModel: "gpt-5",
      archiveAfterMerge: false,
      defaultBranch: "develop",
    });
  });

  it("drops a provider the app does not know", () => {
    const settings = toProjectSettings({
      setupCommands: [],
      env: {},
      copyFiles: [],
      autonomy: "auto",
      defaultProvider: "gemini",
      defaultModel: null,
      archiveAfterMerge: true,
      defaultBranch: null,
    });
    expect(settings.defaultKind).toBeNull();
  });
});

describe("toPatch", () => {
  it("carries only what changed, keeping a cleared default", () => {
    expect(toPatch({ archiveAfterMerge: false })).toEqual({ archiveAfterMerge: false });
    expect(toPatch({ defaultKind: null, defaultModel: null })).toEqual({
      defaultProvider: null,
      defaultModel: null,
    });
    expect(toPatch({ defaultBranch: "develop" })).toEqual({ defaultBranch: "develop" });
    expect(toPatch({ env: [["K", "v"]], filesToCopy: [] })).toEqual({
      env: { K: "v" },
      copyFiles: [],
    });
  });
});
