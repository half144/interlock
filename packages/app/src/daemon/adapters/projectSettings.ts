import type {
  ProjectSettings as DaemonSettings,
  ProjectSettingsPatch,
} from "@interlock/protocol/project-settings-schema";
import type { ProjectSettings } from "@/types";
import { kindOf } from "./providers";

export function toProjectSettings(settings: DaemonSettings): ProjectSettings {
  return {
    setupCommands: settings.setupCommands,
    env: Object.entries(settings.env),
    filesToCopy: settings.copyFiles,
    autonomy: settings.autonomy,
    defaultKind: settings.defaultProvider ? kindOf(settings.defaultProvider) : null,
    defaultModel: settings.defaultModel,
    archiveAfterMerge: settings.archiveAfterMerge,
    defaultBranch: settings.defaultBranch,
  };
}

/** Only the fields that changed go to the daemon, so two edits in a row never overwrite each other. */
export function toPatch(change: Partial<ProjectSettings>): ProjectSettingsPatch {
  return {
    ...(change.setupCommands && { setupCommands: change.setupCommands }),
    ...(change.env && { env: Object.fromEntries(change.env) }),
    ...(change.filesToCopy && { copyFiles: change.filesToCopy }),
    ...(change.autonomy && { autonomy: change.autonomy }),
    ...(change.defaultKind !== undefined && { defaultProvider: change.defaultKind }),
    ...(change.defaultModel !== undefined && { defaultModel: change.defaultModel }),
    ...(change.archiveAfterMerge !== undefined && { archiveAfterMerge: change.archiveAfterMerge }),
    ...(change.defaultBranch !== undefined && { defaultBranch: change.defaultBranch }),
  };
}
