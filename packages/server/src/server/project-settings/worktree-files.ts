import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { runGitCommand } from "../../utils/run-git-command.js";
import { spawnProcess } from "../../utils/spawn.js";

const WORKTREE_INCLUDE_FILE = ".worktreeinclude";

export async function readWorktreeInclude(repoRoot: string): Promise<string[]> {
  let raw: string;
  try {
    raw = await readFile(path.join(repoRoot, WORKTREE_INCLUDE_FILE), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return raw
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

// `.worktreeinclude` uses gitignore syntax and only applies to files git ignores,
// so we list untracked matches and keep the ones `git check-ignore` confirms.
async function expandWorktreeInclude(repoRoot: string): Promise<string[]> {
  if ((await readWorktreeInclude(repoRoot)).length === 0) return [];
  const { stdout } = await runGitCommand(
    [
      "ls-files",
      "-z",
      "--others",
      "--ignored",
      "--directory",
      `--exclude-from=${WORKTREE_INCLUDE_FILE}`,
    ],
    { cwd: repoRoot },
  );
  const candidates = stdout.split("\0").filter((entry) => entry.length > 0);
  return candidates.length === 0 ? [] : checkIgnored(repoRoot, candidates);
}

function checkIgnored(repoRoot: string, paths: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawnProcess("git", ["check-ignore", "-z", "--stdin"], {
      cwd: repoRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr?.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0 || code === 1) {
        resolve(stdout.split("\0").filter((entry) => entry.length > 0));
      } else {
        reject(new Error(`git check-ignore failed (exit ${code}): ${stderr.trim()}`));
      }
    });
    child.stdin?.end(`${paths.join("\0")}\0`);
  });
}

function resolveInside(root: string, relativePath: string): string | null {
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

export interface CopyWorktreeFilesInput {
  repoRoot: string;
  worktreePath: string;
  configuredFiles: readonly string[];
}

export interface CopyWorktreeFilesResult {
  copied: string[];
  skipped: string[];
}

export async function copyFilesIntoWorktree(
  input: CopyWorktreeFilesInput,
): Promise<CopyWorktreeFilesResult> {
  const entries = new Set([
    ...input.configuredFiles,
    ...(await expandWorktreeInclude(input.repoRoot)),
  ]);
  const copied: string[] = [];
  const skipped: string[] = [];
  for (const entry of entries) {
    const source = resolveInside(input.repoRoot, entry);
    const target = resolveInside(input.worktreePath, entry);
    if (
      !source ||
      !target ||
      !(await stat(source).then(
        () => true,
        () => false,
      ))
    ) {
      skipped.push(entry);
      continue;
    }
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { recursive: true, force: false, errorOnExist: false });
    copied.push(entry);
  }
  return { copied, skipped };
}
