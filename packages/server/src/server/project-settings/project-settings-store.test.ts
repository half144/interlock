import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PROJECT_SETTINGS } from "@interlock/protocol/project-settings-schema";
import { ProjectSettingsFileError, ProjectSettingsStore } from "./project-settings-store.js";

describe("ProjectSettingsStore", () => {
  let home: string;
  let repoRoot: string;

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "project-settings-"));
    repoRoot = mkdtempSync(path.join(tmpdir(), "project-settings-repo-"));
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it("returns defaults with archiveAfterMerge on for an unknown project", async () => {
    const settings = await ProjectSettingsStore.forHome(home).get(repoRoot);

    expect(settings).toEqual(DEFAULT_PROJECT_SETTINGS);
    expect(settings.archiveAfterMerge).toBe(true);
    expect(settings.autonomy).toBe("auto");
  });

  it("persists a partial update, keeps untouched fields and writes a versioned file", async () => {
    const store = ProjectSettingsStore.forHome(home);

    await store.update(repoRoot, { setupCommands: ["pnpm install"], autonomy: "full-auto" });
    const updated = await store.update(repoRoot, { env: { NODE_ENV: "development" } });

    expect(updated).toMatchObject({
      setupCommands: ["pnpm install"],
      autonomy: "full-auto",
      env: { NODE_ENV: "development" },
      archiveAfterMerge: true,
    });
    expect(await ProjectSettingsStore.forHome(home).get(repoRoot)).toEqual(updated);
    const onDisk = JSON.parse(readFileSync(path.join(home, "project-settings.json"), "utf8"));
    expect(onDisk.version).toBe(1);
  });

  it("persists the default branch across store reloads and lets it be cleared", async () => {
    const store = ProjectSettingsStore.forHome(home);

    await store.update(repoRoot, { defaultBranch: "develop" });
    expect((await ProjectSettingsStore.forHome(home).get(repoRoot)).defaultBranch).toBe("develop");

    await store.update(repoRoot, { defaultBranch: null });
    expect((await store.get(repoRoot)).defaultBranch).toBeNull();
  });

  it("applies concurrent updates without losing either one", async () => {
    const store = ProjectSettingsStore.forHome(home);

    await Promise.all([
      store.update(repoRoot, { copyFiles: [".env"] }),
      store.update(repoRoot, { defaultProvider: "claude" }),
    ]);

    expect(await store.get(repoRoot)).toMatchObject({
      copyFiles: [".env"],
      defaultProvider: "claude",
    });
  });

  it("rejects copy paths that escape the repository", async () => {
    await expect(
      ProjectSettingsStore.forHome(home).update(repoRoot, { copyFiles: ["../secrets"] }),
    ).rejects.toThrow();
  });

  it("fails with an actionable error when the file is corrupt", async () => {
    writeFileSync(path.join(home, "project-settings.json"), "{ nope");

    await expect(ProjectSettingsStore.forHome(home).get(repoRoot)).rejects.toBeInstanceOf(
      ProjectSettingsFileError,
    );
    await expect(ProjectSettingsStore.forHome(home).get(repoRoot)).rejects.toThrow(/delete it/);
  });
});
