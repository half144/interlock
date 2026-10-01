const key = (rootPath: string) => `interlock:base-branch:${rootPath}`;

/** The daemon keeps no base branch per project, so the pick lives in this window's storage. */
export function savedBaseBranch(rootPath: string): string | null {
  try {
    return localStorage.getItem(key(rootPath));
  } catch {
    return null;
  }
}

export function saveBaseBranch(rootPath: string, branch: string): void {
  try {
    localStorage.setItem(key(rootPath), branch);
  } catch {
    // Storage can be blocked; the pick then lasts until the window reloads.
  }
}
