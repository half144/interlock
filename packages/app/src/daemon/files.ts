import { getClient } from "./client";

export interface FolderEntry {
  name: string;
  /** Relative to the worktree root. */
  path: string;
  kind: "file" | "directory";
}

const HIDDEN = new Set([".git", "node_modules", ".DS_Store"]);

/** One level of the worktree. Folders load as they open, so a big tree costs nothing until you look. */
export async function listFolder(cwd: string, path: string): Promise<FolderEntry[]> {
  const { entries } = await getClient().listDirectory(cwd, path);
  return entries
    .filter((entry) => !HIDDEN.has(entry.name))
    .map(({ name, path: entryPath, kind }) => ({ name, path: entryPath, kind }));
}
