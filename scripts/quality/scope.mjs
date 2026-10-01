import { spawnSync } from "node:child_process";

// Each workspace lists everything it depends on, transitively.
const DEPS = {
  "packages/protocol": [],
  "packages/highlight": [],
  "packages/client": ["packages/protocol"],
  "packages/app": ["packages/client", "packages/protocol"],
  "packages/server": ["packages/client", "packages/highlight", "packages/protocol"],
};
const INERT = /^(docs\/|apps\/desktop\/|.*\.md$)/;

/** Which workspaces a change can break: the ones it touches and everything built on them. A file outside any workspace (root config, scripts) can break all of them. */
export function scopeOf(files) {
  const live = files.filter((f) => !INERT.test(f));
  const touched = new Set();
  let full = false;
  for (const file of live) {
    const dir = file.split("/").slice(0, 2).join("/");
    if (dir in DEPS) touched.add(dir);
    else full = true;
  }
  const workspaces = Object.keys(DEPS).filter(
    (dir) => full || touched.has(dir) || DEPS[dir].some((d) => touched.has(d)),
  );
  return { full, workspaces };
}

const git = (...args) => spawnSync("git", args, { encoding: "utf8" }).stdout.trim();
const lines = (out) => out.split("\n").filter(Boolean);

export const stagedFiles = () => lines(git("diff", "--name-only", "--cached"));

export function changedSinceBase(base = "origin/main") {
  const mergeBase = git("merge-base", base, "HEAD") || base;
  return lines(git("diff", "--name-only", `${mergeBase}...HEAD`));
}

export const nameOf = (dir) => `@interlock/${dir.split("/")[1]}`;

export function runInScope(script, workspaces) {
  for (const dir of workspaces) {
    const { status } = spawnSync(
      "npm",
      ["run", script, "--workspace", nameOf(dir), "--if-present"],
      {
        stdio: "inherit",
      },
    );
    if (status !== 0) return false;
  }
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [script, mode] = process.argv.slice(2);
  const files = mode === "--staged" ? stagedFiles() : changedSinceBase();
  const { workspaces } = scopeOf(files);
  if (workspaces.length === 0) console.log(`${script}: nothing affected, skipped`);
  process.exit(runInScope(script, workspaces) ? 0 : 1);
}
