import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export interface FoundRepository {
  path: string;
  name: string;
  lastActivityAt: Date;
}

const MAX_DEPTH = 4;
const MAX_DIRECTORIES = 4_000;
const NOISE = new Set([
  "node_modules",
  "vendor",
  "dist",
  "build",
  "target",
  "out",
  "coverage",
  "venv",
  "__pycache__",
]);
// Home folders that hold no code. Desktop, Downloads and the media folders would also make macOS ask the
// user for access just to look; Documents stays in because that is where many people keep their code.
const SKIPPED_HOME_FOLDERS = new Set([
  "Library",
  "Applications",
  "Desktop",
  "Downloads",
  "Movies",
  "Music",
  "Pictures",
  "Public",
]);
// What git touches as you work: the index on add and status, the HEAD reflog on commit, checkout and pull.
const ACTIVITY_MARKS = ["index", "logs/HEAD", "HEAD"];

/** The git repositories under `home`, most recently worked on first. Linked worktrees and nested repos are left out. */
export async function findRepositories(home: string, limit: number): Promise<FoundRepository[]> {
  const repositories: string[] = [];
  let level = (await listChildren(home)).directories
    .filter((name) => !SKIPPED_HOME_FOLDERS.has(name))
    .map((name) => path.join(home, name));
  let scanned = 0;

  for (let depth = 1; depth <= MAX_DEPTH && level.length > 0; depth++) {
    const batch = level.slice(0, MAX_DIRECTORIES - scanned);
    scanned += batch.length;
    const listed = await Promise.all(
      batch.map(async (dir) => ({ dir, children: await listChildren(dir) })),
    );
    level = [];
    for (const { dir, children } of listed) {
      if (children.isRepository) repositories.push(dir);
      else if (depth < MAX_DEPTH) level.push(...children.directories.map((n) => path.join(dir, n)));
    }
  }

  const found = await Promise.all(repositories.map(describeRepository));
  return found
    .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
    .slice(0, limit);
}

async function listChildren(dir: string) {
  // Folders the daemon may not read are simply not candidates.
  const entries = await readdir(dir, { withFileTypes: true }).catch((): Dirent[] => []);
  return {
    isRepository: entries.some((entry) => entry.name === ".git" && entry.isDirectory()),
    directories: entries
      .filter(
        (entry) => entry.isDirectory() && !entry.name.startsWith(".") && !NOISE.has(entry.name),
      )
      .map((entry) => entry.name),
  };
}

async function describeRepository(dir: string): Promise<FoundRepository> {
  const touched = await Promise.all(
    ACTIVITY_MARKS.map((mark) =>
      stat(path.join(dir, ".git", mark)).then(
        (info) => info.mtimeMs,
        () => 0,
      ),
    ),
  );
  return { path: dir, name: path.basename(dir), lastActivityAt: new Date(Math.max(...touched)) };
}
