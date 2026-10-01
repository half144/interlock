import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// One ESLint process per workspace: type-aware linting of the whole monorepo in a
// single process runs out of memory. Suppressions are keyed by path, so a run per
// target updates only its own files in eslint-suppressions.json.
const WORKSPACE_ROOTS = ["packages", "apps"];
const ROOT_TARGETS = ["scripts", "eslint.config.js", "commitlint.config.js"];

function lintTargets(root = process.cwd()) {
  const workspaces = WORKSPACE_ROOTS.flatMap((dir) =>
    existsSync(join(root, dir))
      ? readdirSync(join(root, dir), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => `${dir}/${entry.name}`)
      : [],
  );
  return [...workspaces, ...ROOT_TARGETS.filter((target) => existsSync(join(root, target)))];
}

function main() {
  const extra = process.argv.slice(2);
  const bin = join("node_modules", ".bin", "eslint");
  const env = { ...process.env, NODE_OPTIONS: "--max-old-space-size=8192" };
  const pruning = extra.includes("--prune-suppressions");
  let failed = false;
  for (const target of lintTargets()) {
    console.log(`eslint ${target}`);
    const result = spawnSync(
      bin,
      [
        target,
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
