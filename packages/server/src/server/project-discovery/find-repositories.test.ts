import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findRepositories } from "./find-repositories.js";

describe("findRepositories", () => {
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "find-repositories-"));
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  function repo(relative: string, touchedAt = new Date("2026-01-01T00:00:00Z")) {
    const git = path.join(home, relative, ".git");
    mkdirSync(path.join(git, "logs"), { recursive: true });
    for (const mark of ["HEAD", "index", "logs/HEAD"]) {
      writeFileSync(path.join(git, mark), "");
      utimesSync(path.join(git, mark), touchedAt, touchedAt);
    }
  }

  const names = async (limit = 10) => (await findRepositories(home, limit)).map((r) => r.name);

  it("lists repositories by their latest git activity, newest first", async () => {
    repo("code/older", new Date("2026-03-01T00:00:00Z"));
    repo("Documents/personal/newer", new Date("2026-09-01T00:00:00Z"));

    const found = await findRepositories(home, 10);

    expect(found.map((r) => r.name)).toEqual(["newer", "older"]);
    expect(found[0]).toEqual({
      path: path.join(home, "Documents/personal/newer"),
      name: "newer",
      lastActivityAt: new Date("2026-09-01T00:00:00Z"),
    });
  });

  it("stops at the limit", async () => {
    repo("code/a", new Date("2026-01-01T00:00:00Z"));
    repo("code/b", new Date("2026-02-01T00:00:00Z"));
    repo("code/c", new Date("2026-03-01T00:00:00Z"));

    expect(await names(2)).toEqual(["c", "b"]);
  });

  it("skips hidden folders, build output, macOS home folders and anything too deep", async () => {
    repo(".config/dotfiles");
    repo("code/node_modules/pkg");
    repo("Desktop/scratch");
    repo("Library/cache");
    repo("a/b/c/d/too-deep");
    repo("a/b/c/deep-enough");

    expect(await names()).toEqual(["deep-enough"]);
  });

  it("leaves out nested repositories, linked worktrees and a home that is itself a repository", async () => {
    repo("code/outer");
    repo("code/outer/packages/inner");
    mkdirSync(path.join(home, "code/linked"), { recursive: true });
    writeFileSync(path.join(home, "code/linked/.git"), "gitdir: /elsewhere");
    mkdirSync(path.join(home, ".git"));

    expect(await names()).toEqual(["outer"]);
  });
});
