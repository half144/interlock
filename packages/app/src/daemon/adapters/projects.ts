import type {
  WorkspaceDescriptorPayload,
  WorkspaceProjectDescriptorPayload,
} from "@interlock/protocol/messages";
import type { Project, ProjectSettings, Workspace } from "@/types";

const defaultProjectSettings = (): ProjectSettings => ({
  setupCommands: [],
  env: [],
  filesToCopy: [],
  autonomy: "auto",
  defaultKind: null,
  defaultModel: null,
  archiveAfterMerge: true,
});

export function toProject(
  descriptor: WorkspaceProjectDescriptorPayload,
  extras: { remoteUrl?: string | null; defaultBranch?: string } = {},
): Project {
  return {
    id: descriptor.projectId,
    name: descriptor.projectDisplayName,
    rootPath: descriptor.projectRootPath,
    remoteUrl: extras.remoteUrl ?? null,
    defaultBranch: extras.defaultBranch ?? "main",
    settings: defaultProjectSettings(),
  };
}

export function addProjectFailure(result: {
  error: string | null;
  errorCode?: string | null | undefined;
}): string {
  if (result.errorCode === "not_a_git_repo") {
    return "This folder is not a git repository. Interlock runs each task in a git worktree, so run `git init` and make a first commit there, or pick a different folder.";
  }
  if (result.errorCode === "directory_not_found") {
    return "That folder does not exist. Check the path and try again.";
  }
  return result.error ?? "The daemon did not add the folder as a project.";
}

export function toWorkspace(workspace: WorkspaceDescriptorPayload): Workspace {
  return {
    id: workspace.id,
    projectId: workspace.projectId,
    directory: workspace.workspaceDirectory,
    name: workspace.name,
    branch: workspace.gitRuntime?.currentBranch ?? null,
    remoteUrl: workspace.gitRuntime?.remoteUrl ?? null,
    isWorktree: workspace.workspaceKind === "worktree",
    additions: workspace.diffStat?.additions ?? 0,
    deletions: workspace.diffStat?.deletions ?? 0,
  };
}

export function pullRequestOf(
  workspace: WorkspaceDescriptorPayload,
): { number: number | null; merged: boolean } | null {
  const pr = workspace.githubRuntime?.pullRequest;
  return pr ? { number: pr.number ?? null, merged: pr.isMerged } : null;
}
