import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { changedSinceBase, cleanEnv, runInScope, scopeOf } from "./scope.mjs";

const git = (...args) => spawnSync("git", args, { encoding: "utf8" }).stdout.trim();
const stampPath = `${git("rev-parse", "--git-dir")}/quality-green`;
// The result depends on the committed tree and on the base it is measured against.
const key = `${git("rev-parse", "HEAD^{tree}")}:${git("rev-parse", "origin/main")}`;

const run = (command, args) =>
  spawnSync(command, args, { stdio: "inherit", env: cleanEnv() }).status === 0;
const npm = (...args) => run("npm", ["run", ...args]);

// Only a clean tree can be stamped: the stamp vouches for exactly what is committed.
function stamp() {
  if (git("status", "--porcelain") === "") writeFileSync(stampPath, key);
}

if (process.argv.includes("--stamp")) {
  stamp();
  process.exit(0);
}

if (existsSync(stampPath) && readFileSync(stampPath, "utf8") === key) {
  console.log("pre-push: this exact tree already passed, skipped");
  process.exit(0);
}

const files = changedSinceBase();
const { full, workspaces } = scopeOf(files);
const sources = files.filter((f) => /\.(m?[jt]sx?)$/.test(f));

const steps = [
  () => npm("build:deps"),
  () => npm("format:check"),
  () => (full ? npm("lint") : run("node", ["scripts/quality/lint-staged.mjs", ...sources])),
  () => runInScope("typecheck", workspaces),
  () => npm("structure"),
  () => npm("knip"),
  () => npm("dup"),
  () => runInScope("test", workspaces),
  () => run("node", ["--test", "scripts/quality/**/*.test.mjs"]),
];

if (!steps.every((step) => step())) process.exit(1);
stamp();
