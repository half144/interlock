import type { Project, ProjectSettings } from "@/types";
import { toPatch, toProjectSettings } from "./adapters/projectSettings";
import { getClient } from "./client";

export interface LoadedSettings {
  settings: ProjectSettings;
  worktreeInclude: string[];
}

function settingsOf(
  result: Awaited<ReturnType<ReturnType<typeof getClient>["getProjectSettings"]>>,
) {
  if (result.error || !result.settings) {
    throw new Error(result.error ?? "The daemon has no settings for this project.");
  }
  return { settings: toProjectSettings(result.settings), worktreeInclude: result.worktreeInclude };
}

export async function loadProjectSettings(projectId: string): Promise<LoadedSettings> {
  return settingsOf(await getClient().getProjectSettings(projectId));
}

export async function saveProjectSettings(
  projectId: string,
  change: Partial<ProjectSettings>,
): Promise<LoadedSettings> {
  return settingsOf(await getClient().updateProjectSettings({ projectId, patch: toPatch(change) }));
}

/** The install command the project's lockfile points at, or null when there is no lockfile. */
export async function suggestSetupCommand(projectId: string): Promise<string | null> {
  const result = await getClient().suggestProjectSetup(projectId);
  if (result.error) throw new Error(result.error);
  return result.suggestion?.command ?? null;
}

export async function removeProject(projectId: string): Promise<void> {
  await getClient().removeProject(projectId);
}

export async function listBranches(project: Project): Promise<string[]> {
  const result = await getClient().getBranchSuggestions({ cwd: project.rootPath, limit: 200 });
  if (result.error) throw new Error(result.error);
  return result.branches;
}
