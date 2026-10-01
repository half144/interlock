import type { Logger } from "pino";
import type { ProjectSettings } from "@interlock/protocol/project-settings-schema";
import type { WorkspaceGitRuntimeSnapshot } from "../../workspace-git-service.js";

interface ProjectSettingsReader {
  get(projectRoot: string): Promise<Pick<ProjectSettings, "archiveAfterMerge">>;
}

/** Reads the project's `archiveAfterMerge` setting; an unreadable settings file means the default (true). */
export function createArchiveAfterMergeReader(
  store: ProjectSettingsReader,
  logger: Logger,
): (snapshot: WorkspaceGitRuntimeSnapshot) => Promise<boolean> {
  return async (snapshot) => {
    const projectRoot = snapshot.git.mainRepoRoot ?? snapshot.git.repoRoot ?? snapshot.cwd;
    try {
      return (await store.get(projectRoot)).archiveAfterMerge;
    } catch (error) {
      logger.warn(
        { err: error, projectRoot },
        "Project settings unreadable; archiving after merge",
      );
      return true;
    }
  };
}
