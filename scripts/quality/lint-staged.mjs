import { spawnSync } from "node:child_process";
import { join } from "node:path";

const CHUNK = 80;

export function groupFiles(files) {
  const groups = new Map();
  for (const file of files) {
    const parts = file.split("/");
    const key = ["packages", "apps"].includes(parts[0] ?? "")
      ? parts.slice(0, 2).join("/")
      : "root";
    const list = groups.get(key) ?? [];
    list.push(file);
    groups.set(key, list);
  }
  return [...groups.values()].flatMap((list) => {
    const chunks = [];
    for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));
    return chunks;
  });
}

function main() {
  const files = process.argv.slice(2);
  const bin = join("node_modules", ".bin", "eslint");
  // Type-aware lint of many workspaces in one process runs out of memory, so each
  // workspace (and every 80 files within it) gets its own process.
  const env = { ...process.env, NODE_OPTIONS: "--max-old-space-size=6144" };
  let failed = false;
  for (const chunk of groupFiles(files)) {
    const result = spawnSync(bin, ["--max-warnings", "0", "--no-warn-ignored", ...chunk], {
      stdio: "inherit",
      env,
    });
    failed ||= result.status !== 0;
  }
  process.exitCode = failed ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
