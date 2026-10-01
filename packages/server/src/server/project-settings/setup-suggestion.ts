import { access } from "node:fs/promises";
import path from "node:path";
import type { PackageManager, SetupSuggestion } from "@interlock/protocol/project-settings-schema";

const LOCKFILES: readonly { file: string; packageManager: PackageManager; command: string }[] = [
  { file: "bun.lock", packageManager: "bun", command: "bun install" },
  { file: "bun.lockb", packageManager: "bun", command: "bun install" },
  { file: "pnpm-lock.yaml", packageManager: "pnpm", command: "pnpm install" },
  { file: "yarn.lock", packageManager: "yarn", command: "yarn install" },
  { file: "package-lock.json", packageManager: "npm", command: "npm install" },
  { file: "npm-shrinkwrap.json", packageManager: "npm", command: "npm install" },
];

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function suggestSetup(repoRoot: string): Promise<SetupSuggestion | null> {
  for (const lockfile of LOCKFILES) {
    if (await exists(path.join(repoRoot, lockfile.file))) {
      return {
        packageManager: lockfile.packageManager,
        lockfile: lockfile.file,
        command: lockfile.command,
      };
    }
  }
  return null;
}
