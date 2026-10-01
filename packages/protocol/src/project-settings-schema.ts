import { z } from "zod";

export const AutonomyModeSchema = z.enum(["auto", "full-auto"]);
export type AutonomyMode = z.infer<typeof AutonomyModeSchema>;

export const PROJECT_SETTINGS_VERSION = 1;

function isRepoRelativePath(value: string): boolean {
  return (
    !value.startsWith("/") && !/^[A-Za-z]:/u.test(value) && !value.split(/[\\/]/u).includes("..")
  );
}

export const ProjectSettingsSchema = z.object({
  setupCommands: z.array(z.string().trim().min(1)),
  env: z.record(z.string().min(1), z.string()),
  copyFiles: z.array(
    z.string().trim().min(1).refine(isRepoRelativePath, "Expected a path inside the repo"),
  ),
  autonomy: AutonomyModeSchema,
  defaultProvider: z.string().min(1).nullable(),
  defaultModel: z.string().min(1).nullable(),
  archiveAfterMerge: z.boolean(),
  /** Base branch new tasks start from; null means the repo's detected default branch. */
  defaultBranch: z.string().trim().min(1).nullable(),
});
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

export const ProjectSettingsPatchSchema = ProjectSettingsSchema.partial();
export type ProjectSettingsPatch = z.infer<typeof ProjectSettingsPatchSchema>;

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  setupCommands: [],
  env: {},
  copyFiles: [],
  autonomy: "auto",
  defaultProvider: null,
  defaultModel: null,
  archiveAfterMerge: true,
  defaultBranch: null,
};

export const PackageManagerSchema = z.enum(["pnpm", "npm", "yarn", "bun"]);
export type PackageManager = z.infer<typeof PackageManagerSchema>;

export const SetupSuggestionSchema = z.object({
  packageManager: PackageManagerSchema,
  lockfile: z.string(),
  command: z.string(),
});
export type SetupSuggestion = z.infer<typeof SetupSuggestionSchema>;

export const ProjectGitInfoSchema = z.object({
  defaultBranch: z.string().nullable(),
  remoteName: z.string().nullable(),
  remoteUrl: z.string().nullable(),
});
export type ProjectGitInfo = z.infer<typeof ProjectGitInfoSchema>;

export const ProjectSettingsErrorCodeSchema = z.enum([
  "project_not_found",
  "not_a_git_repo",
  "invalid_settings",
]);

const ProjectSettingsPayloadSchema = z.object({
  requestId: z.string(),
  projectId: z.string(),
  settings: ProjectSettingsSchema.nullable(),
  worktreeInclude: z.array(z.string()),
  error: z.string().nullable(),
  errorCode: ProjectSettingsErrorCodeSchema.nullish().catch(null),
});

export const ProjectSettingsGetRequestSchema = z.object({
  type: z.literal("project.settings.get.request"),
  requestId: z.string(),
  projectId: z.string(),
});

export const ProjectSettingsGetResponseSchema = z.object({
  type: z.literal("project.settings.get.response"),
  payload: ProjectSettingsPayloadSchema,
});

export const ProjectSettingsUpdateRequestSchema = z.object({
  type: z.literal("project.settings.update.request"),
  requestId: z.string(),
  projectId: z.string(),
  patch: ProjectSettingsPatchSchema,
});

export const ProjectSettingsUpdateResponseSchema = z.object({
  type: z.literal("project.settings.update.response"),
  payload: ProjectSettingsPayloadSchema,
});

export const ProjectSetupSuggestRequestSchema = z.object({
  type: z.literal("project.setup.suggest.request"),
  requestId: z.string(),
  projectId: z.string(),
});

export const ProjectSetupSuggestResponseSchema = z.object({
  type: z.literal("project.setup.suggest.response"),
  payload: z.object({
    requestId: z.string(),
    projectId: z.string(),
    suggestion: SetupSuggestionSchema.nullable(),
    error: z.string().nullable(),
    errorCode: ProjectSettingsErrorCodeSchema.nullish().catch(null),
  }),
});

export const ProjectSettingsInboundSchemas = [
  ProjectSettingsGetRequestSchema,
  ProjectSettingsUpdateRequestSchema,
  ProjectSetupSuggestRequestSchema,
] as const;

export const ProjectSettingsOutboundSchemas = [
  ProjectSettingsGetResponseSchema,
  ProjectSettingsUpdateResponseSchema,
  ProjectSetupSuggestResponseSchema,
] as const;
