import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { suggestSetup } from "./setup-suggestion.js";

describe("suggestSetup", () => {
  let repoRoot: string;

  beforeEach(() => {
    repoRoot = mkdtempSync(path.join(tmpdir(), "setup-suggestion-"));
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it.each([
    ["pnpm-lock.yaml", "pnpm", "pnpm install"],
    ["package-lock.json", "npm", "npm install"],
    ["yarn.lock", "yarn", "yarn install"],
    ["bun.lock", "bun", "bun install"],
    ["bun.lockb", "bun", "bun install"],
  ])("detects %s", async (lockfile, packageManager, command) => {
    writeFileSync(path.join(repoRoot, lockfile), "");

    expect(await suggestSetup(repoRoot)).toEqual({ packageManager, lockfile, command });
  });

  it("prefers bun and pnpm over npm when several lockfiles exist", async () => {
    writeFileSync(path.join(repoRoot, "package-lock.json"), "");
    writeFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "");

    expect((await suggestSetup(repoRoot))?.packageManager).toBe("pnpm");
  });

  it("returns null without a lockfile", async () => {
    expect(await suggestSetup(repoRoot)).toBeNull();
  });
});
