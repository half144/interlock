import { resolvePaseoHome } from "../paseo-home.js";
import { ProjectSettingsStore } from "./project-settings-store.js";
import { copyFilesIntoWorktree } from "./worktree-files.js";

export interface WorktreeSetup {
  commands: string[];
  env: Record<string, string>;
}

export interface PrepareWorktreeSetupInput {
  paseoHome?: string;
  repoRoot: string;
  worktreePath: string;
}

export async function prepareWorktreeSetup(
  input: PrepareWorktreeSetupInput,
): Promise<WorktreeSetup> {
  const settings = await ProjectSettingsStore.forHome(input.paseoHome ?? resolvePaseoHome()).get(
    input.repoRoot,
  );
  await copyFilesIntoWorktree({
    repoRoot: input.repoRoot,
    worktreePath: input.worktreePath,
    configuredFiles: settings.copyFiles,
  });
  return { commands: settings.setupCommands, env: settings.env };
}
