import type { ProjectGitInfo } from "@interlock/protocol/project-settings-schema";

export interface ProjectGitInfoDeps {
  getCheckout(cwd: string): Promise<{ isGit: boolean; remoteUrl: string | null }>;
  resolveDefaultBranch(cwd: string): Promise<string>;
}

export class NotAGitRepoError extends Error {
  constructor(readonly directory: string) {
    super(
      `${directory} is not a git repository. Run \`git init\` in that folder, or choose the folder that contains your repository.`,
    );
    this.name = "NotAGitRepoError";
  }
}

const DEFAULT_REMOTE_NAME = "origin";

export async function inspectGitProject(
  cwd: string,
  deps: ProjectGitInfoDeps,
): Promise<ProjectGitInfo> {
  const checkout = await deps.getCheckout(cwd);
  if (!checkout.isGit) {
    throw new NotAGitRepoError(cwd);
  }
  const defaultBranch = await deps.resolveDefaultBranch(cwd).catch(() => null);
  return {
    defaultBranch,
    remoteName: checkout.remoteUrl ? DEFAULT_REMOTE_NAME : null,
    remoteUrl: checkout.remoteUrl,
  };
}
