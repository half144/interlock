import type { ProjectGitInfo } from "@interlock/protocol/project-settings-schema";

export interface ProjectGitInfoDeps {
  getCheckout(cwd: string): Promise<{ isGit: boolean; remoteUrl: string | null }>;
  resolveDefaultBranch(cwd: string): Promise<string>;
}

const DEFAULT_REMOTE_NAME = "origin";

/** Null for a plain folder: it is a project too, only without git features. */
export async function inspectGitProject(
  cwd: string,
  deps: ProjectGitInfoDeps,
): Promise<ProjectGitInfo | null> {
  const checkout = await deps.getCheckout(cwd);
  if (!checkout.isGit) return null;
  const defaultBranch = await deps.resolveDefaultBranch(cwd).catch(() => null);
  return {
    defaultBranch,
    remoteName: checkout.remoteUrl ? DEFAULT_REMOTE_NAME : null,
    remoteUrl: checkout.remoteUrl,
  };
}
