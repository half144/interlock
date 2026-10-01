import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectSettingsStore } from "./project-settings-store.js";
import { prepareWorktreeSetup } from "./worktree-setup.js";

describe("prepareWorktreeSetup", () => {
  let tempDir: string;
  let home: string;
  let repoRoot: string;
  let worktreePath: string;

  beforeEach(() => {
    tempDir = realpathSync(mkdtempSync(path.join(tmpdir(), "worktree-setup-")));
    home = path.join(tempDir, "home");
    repoRoot = path.join(tempDir, "repo");
    worktreePath = path.join(tempDir, "worktree");
    for (const dir of [home, repoRoot, worktreePath]) mkdirSync(dir);
    execFileSync("git", ["init", "-b", "main"], { cwd: repoRoot, stdio: "pipe" });
    writeFileSync(path.join(repoRoot, ".env"), "A=1\n");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns the project's setup commands and env and copies the configured files", async () => {
    await ProjectSettingsStore.forHome(home).update(repoRoot, {
      setupCommands: ["pnpm install"],
      env: { NODE_ENV: "development" },
      copyFiles: [".env"],
    });

    const setup = await prepareWorktreeSetup({ paseoHome: home, repoRoot, worktreePath });

    expect(setup).toEqual({ commands: ["pnpm install"], env: { NODE_ENV: "development" } });
    expect(existsSync(path.join(worktreePath, ".env"))).toBe(true);
  });

  it("ignores a repo-level paseo.json", async () => {
    writeFileSync(
      path.join(repoRoot, "paseo.json"),
      JSON.stringify({ worktree: { setup: ["echo from-paseo-json"] } }),
    );

    const setup = await prepareWorktreeSetup({ paseoHome: home, repoRoot, worktreePath });

    expect(setup.commands).toEqual([]);
  });
});
