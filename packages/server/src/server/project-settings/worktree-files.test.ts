import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyFilesIntoWorktree, readWorktreeInclude } from "./worktree-files.js";

describe("worktree files", () => {
  let tempDir: string;
  let repoRoot: string;
  let worktreePath: string;

  beforeEach(() => {
    tempDir = realpathSync(mkdtempSync(path.join(tmpdir(), "worktree-files-")));
    repoRoot = path.join(tempDir, "repo");
    worktreePath = path.join(tempDir, "worktree");
    mkdirSync(repoRoot);
    mkdirSync(worktreePath);
    execFileSync("git", ["init", "-b", "main"], { cwd: repoRoot, stdio: "pipe" });
    writeFileSync(path.join(repoRoot, ".gitignore"), ".env*\nconfig/local.json\n");
    mkdirSync(path.join(repoRoot, "config"));
    writeFileSync(path.join(repoRoot, ".env"), "A=1\n");
    writeFileSync(path.join(repoRoot, ".env.local"), "B=2\n");
    writeFileSync(path.join(repoRoot, "config/local.json"), "{}");
    writeFileSync(path.join(repoRoot, "notes.txt"), "not ignored");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("reads .worktreeinclude patterns without comments or blanks", async () => {
    writeFileSync(
      path.join(repoRoot, ".worktreeinclude"),
      "# secrets\n.env*\n\n  config/local.json  \n",
    );

    expect(await readWorktreeInclude(repoRoot)).toEqual([".env*", "config/local.json"]);
  });

  it("returns no patterns when .worktreeinclude is missing", async () => {
    expect(await readWorktreeInclude(repoRoot)).toEqual([]);
  });

  it("copies gitignored files matched by .worktreeinclude and skips files git does not ignore", async () => {
    writeFileSync(path.join(repoRoot, ".worktreeinclude"), ".env*\nconfig/local.json\nnotes.txt\n");

    const result = await copyFilesIntoWorktree({ repoRoot, worktreePath, configuredFiles: [] });

    expect(result.copied.sort()).toEqual([".env", ".env.local", "config/local.json"]);
    expect(readFileSync(path.join(worktreePath, ".env"), "utf8")).toBe("A=1\n");
    expect(existsSync(path.join(worktreePath, "config/local.json"))).toBe(true);
    expect(existsSync(path.join(worktreePath, "notes.txt"))).toBe(false);
  });

  it("copies configured files and directories, skipping missing ones and never overwriting", async () => {
    writeFileSync(path.join(worktreePath, ".env"), "existing\n");

    const result = await copyFilesIntoWorktree({
      repoRoot,
      worktreePath,
      configuredFiles: [".env", "config", "missing.txt", "../outside"],
    });

    expect(result.copied).toEqual([".env", "config"]);
    expect(result.skipped).toEqual(["missing.txt", "../outside"]);
    expect(readFileSync(path.join(worktreePath, ".env"), "utf8")).toBe("existing\n");
    expect(existsSync(path.join(worktreePath, "config/local.json"))).toBe(true);
  });
});
