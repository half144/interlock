import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// One ESLint process per workspace: type-aware linting of the whole monorepo in a
// single process runs out of memory. Suppressions are keyed by path, so a run per
// target updates only its own files in eslint-suppressions.json.
const WORKSPACE_ROOTS = ["packages", "apps"];
const ROOT_TARGETS = ["scripts", "eslint.config.js", "commitlint.config.js"];

// Workspaces whose type-aware pass exceeds the heap even at 8 GB are linted in chunks.
const CHUNKED_WORKSPACES = { "packages/server": { entry: "src", maxFiles: 80 } };
const LINTED_EXTENSIONS = /\.(ts|tsx|js|mjs|cjs)$/;

function listEntries(dir) {
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => !entry.name.startsWith("."));
}

function countFiles(dir) {
  return listEntries(dir).reduce(
    (total, entry) =>
      total +
      (entry.isDirectory()
        ? countFiles(join(dir, entry.name))
        : Number(LINTED_EXTENSIONS.test(entry.name))),
    0,
  );
}

function chunkDirectory(dir, maxFiles) {
  if (countFiles(dir) <= maxFiles) return [[dir]];
  const entries = listEntries(dir);
  const files = entries
    .filter((entry) => entry.isFile() && LINTED_EXTENSIONS.test(entry.name))
    .map((entry) => `${dir}/${entry.name}`);
  const fileChunks = [];
  for (let i = 0; i < files.length; i += maxFiles) fileChunks.push(files.slice(i, i + maxFiles));
  const subdirs = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => chunkDirectory(`${dir}/${entry.name}`, maxFiles));
  return [...fileChunks, ...subdirs];
}

function expandWorkspace(workspace, root) {
  const chunked = CHUNKED_WORKSPACES[workspace];
  if (!chunked) return [[workspace]];
  const entryDir = `${workspace}/${chunked.entry}`;
  const rest = listEntries(join(root, workspace))
    .filter((entry) => entry.isDirectory() || LINTED_EXTENSIONS.test(entry.name))
    .filter((entry) => !["node_modules", "dist"].includes(entry.name))
    .filter((entry) => `${workspace}/${entry.name}` !== entryDir)
    .map((entry) => `${workspace}/${entry.name}`);
  return [...(rest.length > 0 ? [rest] : []), ...chunkDirectory(entryDir, chunked.maxFiles)];
}

function lintTargets(root = process.cwd()) {
  const workspaces = WORKSPACE_ROOTS.flatMap((dir) =>
    existsSync(join(root, dir))
      ? readdirSync(join(root, dir), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => `${dir}/${entry.name}`)
      : [],
  );
  return [
    ...workspaces.flatMap((workspace) => expandWorkspace(workspace, root)),
    ...ROOT_TARGETS.filter((target) => existsSync(join(root, target))).map((target) => [target]),
  ];
}

function main() {
  const extra = process.argv.slice(2);
  const bin = join("node_modules", ".bin", "eslint");
  const env = { ...process.env, NODE_OPTIONS: "--max-old-space-size=8192" };
  const pruning = extra.includes("--prune-suppressions");
  let failed = false;
  for (const target of lintTargets()) {
    console.log(`eslint ${target.length > 1 ? `${target[0]} (+${target.length - 1})` : target[0]}`);
    const result = spawnSync(
      bin,
      [
        ...target,
        "--no-error-on-unmatched-pattern",
        ...(pruning ? [] : ["--max-warnings", "0"]),
        ...extra,
      ],
      {
        stdio: "inherit",
        env,
      },
    );
    failed ||= result.status !== 0;
  }
  process.exitCode = failed ? 1 : 0;
}

main();
