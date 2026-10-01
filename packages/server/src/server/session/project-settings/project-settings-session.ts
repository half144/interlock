import type pino from "pino";
import { ProjectSettingsPatchSchema } from "@interlock/protocol/project-settings-schema";
import type { SessionInboundMessage, SessionOutboundMessage } from "../../messages.js";
import type { ProjectRegistry } from "../../workspace-registry.js";
import type { WorkspaceGitService } from "../../workspace-git-service.js";
import { suggestSetup } from "../../project-settings/setup-suggestion.js";
import type { ProjectSettingsStore } from "../../project-settings/project-settings-store.js";
import { readWorktreeInclude } from "../../project-settings/worktree-files.js";

type SettingsRequest = Extract<
  SessionInboundMessage,
  { type: "project.settings.get.request" | "project.settings.update.request" }
>;
type SettingsResponse = Extract<
  SessionOutboundMessage,
  { type: "project.settings.get.response" | "project.settings.update.response" }
>;
type SetupSuggestRequest = Extract<
  SessionInboundMessage,
  { type: "project.setup.suggest.request" }
>;
type ErrorCode = NonNullable<SettingsResponse["payload"]["errorCode"]>;

export interface ProjectSettingsSessionOptions {
  host: { emit(msg: SessionOutboundMessage): void };
  projectRegistry: Pick<ProjectRegistry, "get">;
  workspaceGitService: Pick<WorkspaceGitService, "resolveRepoRoot">;
  store: ProjectSettingsStore;
  logger: pino.Logger;
}

class ProjectSettingsRequestError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export class ProjectSettingsSession {
  constructor(private readonly options: ProjectSettingsSessionOptions) {}

  async handleGetRequest(
    msg: Extract<SessionInboundMessage, { type: "project.settings.get.request" }>,
  ): Promise<void> {
    await this.respondWithSettings(msg, "project.settings.get.response", (repoRoot) =>
      this.options.store.get(repoRoot),
    );
  }

  async handleUpdateRequest(
    msg: Extract<SessionInboundMessage, { type: "project.settings.update.request" }>,
  ): Promise<void> {
    await this.respondWithSettings(msg, "project.settings.update.response", (repoRoot) => {
      const patch = ProjectSettingsPatchSchema.safeParse(msg.patch);
      if (!patch.success) {
        throw new ProjectSettingsRequestError("invalid_settings", patch.error.message);
      }
      return this.options.store.update(repoRoot, patch.data);
    });
  }

  async handleSuggestSetupRequest(msg: SetupSuggestRequest): Promise<void> {
    try {
      const repoRoot = await this.resolveRepoRoot(msg.projectId);
      this.options.host.emit({
        type: "project.setup.suggest.response",
        payload: {
          requestId: msg.requestId,
          projectId: msg.projectId,
          suggestion: await suggestSetup(repoRoot),
          error: null,
        },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, projectId: msg.projectId }, "Setup suggestion failed");
      this.options.host.emit({
        type: "project.setup.suggest.response",
        payload: {
          requestId: msg.requestId,
          projectId: msg.projectId,
          suggestion: null,
          error: error instanceof Error ? error.message : String(error),
          errorCode: error instanceof ProjectSettingsRequestError ? error.code : null,
        },
      });
    }
  }

  private async respondWithSettings(
    msg: SettingsRequest,
    type: SettingsResponse["type"],
    load: (repoRoot: string) => Promise<NonNullable<SettingsResponse["payload"]["settings"]>>,
  ): Promise<void> {
    try {
      const repoRoot = await this.resolveRepoRoot(msg.projectId);
      const settings = await load(repoRoot);
      this.options.host.emit({
        type,
        payload: {
          requestId: msg.requestId,
          projectId: msg.projectId,
          settings,
          worktreeInclude: await readWorktreeInclude(repoRoot),
          error: null,
        },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, projectId: msg.projectId }, "Project settings failed");
      this.options.host.emit({
        type,
        payload: {
          requestId: msg.requestId,
          projectId: msg.projectId,
          settings: null,
          worktreeInclude: [],
          error: error instanceof Error ? error.message : String(error),
          errorCode: error instanceof ProjectSettingsRequestError ? error.code : null,
        },
      });
    }
  }

  private async resolveRepoRoot(projectId: string): Promise<string> {
    const project = await this.options.projectRegistry.get(projectId);
    if (!project || project.archivedAt) {
      throw new ProjectSettingsRequestError(
        "project_not_found",
        `Project ${projectId} was not found. Add it again from the sidebar.`,
      );
    }
    if (project.kind !== "git") {
      throw new ProjectSettingsRequestError(
        "not_a_git_repo",
        `${project.rootPath} is not a git repository, so it has no project settings.`,
      );
    }
    return this.options.workspaceGitService.resolveRepoRoot(project.rootPath);
  }
}
