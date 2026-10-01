import type { Project, Workspace } from "@/types";

/**
 * What the daemon's project list does not say, read from the project's workspaces: the remote of the
 * repository and its default branch: the one picked in settings, else the branch the main checkout sits on.
 */
export function withProjectMeta(
  projects: Record<string, Project>,
  workspaces: Record<string, Workspace>,
): Record<string, Project> {
  const all = Object.values(workspaces);
  return Object.fromEntries(
    Object.entries(projects).map(([id, project]) => {
      const own = all.filter((w) => w.projectId === id);
      const remoteUrl = own.find((w) => w.remoteUrl)?.remoteUrl ?? project.remoteUrl;
      const main = own.find((w) => !w.isWorktree && w.branch);
      return [
        id,
        {
          ...project,
          remoteUrl,
          defaultBranch: project.settings.defaultBranch ?? main?.branch ?? project.defaultBranch,
        },
      ];
    }),
  );
}
