import type pino from "pino";
import type { SessionInboundMessage, SessionOutboundMessage } from "../../messages.js";
import type { ForgeService } from "../../../services/forge-service.js";
import type { ArchiveDependencies } from "../../workspace-archive-service.js";
import type { WorkspaceGitService } from "../../workspace-git-service.js";
import type { GitMutationService } from "../git-mutation/git-mutation-service.js";
import { createTaskPullRequest } from "./create-task-pr.js";
import { discardTask } from "./discard-task.js";
import { toShipError } from "./ship-errors.js";

export interface ShipSessionOptions {
  emit(msg: SessionOutboundMessage): void;
  workspaceGitService: Pick<WorkspaceGitService, "resolveForge">;
  gitMutation: Pick<GitMutationService, "notifyGitMutation">;
  archiveDependencies(): ArchiveDependencies;
  logger: pino.Logger;
}

export class ShipSession {
  constructor(private readonly options: ShipSessionOptions) {}

  async handleCreatePrRequest(
    msg: Extract<SessionInboundMessage, { type: "task_create_pr_request" }>,
  ): Promise<void> {
    const { cwd, requestId } = msg;
    try {
      const result = await createTaskPullRequest(
        { resolveForgeService: (target) => this.resolveForgeService(target) },
        {
          cwd,
          title: msg.title.trim(),
          planItems: msg.planItems ?? [],
          baseRef: msg.baseRef,
        },
      );
      await this.options.gitMutation.notifyGitMutation(cwd, "create-pr", {
        invalidateForge: true,
      });
      this.options.emit({
        type: "task_create_pr_response",
        payload: {
          cwd,
          number: result.number,
          url: result.url,
          committed: result.committed,
          error: null,
          requestId,
        },
      });
      this.options.emit({
        type: "task_ship_update",
        payload: { kind: "pr_created", cwd, number: result.number, url: result.url },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, cwd }, "Create PR failed");
      this.options.emit({
        type: "task_create_pr_response",
        payload: {
          cwd,
          number: null,
          url: null,
          committed: false,
          error: toShipError(error),
          requestId,
        },
      });
    }
  }

  async handleDiscardRequest(
    msg: Extract<SessionInboundMessage, { type: "task_discard_request" }>,
  ): Promise<void> {
    const { cwd, requestId } = msg;
    try {
      const { branchDeleted } = await discardTask(this.options.archiveDependencies(), {
        cwd,
        requestId,
      });
      this.options.emit({
        type: "task_discard_response",
        payload: { cwd, success: true, branchDeleted, error: null, requestId },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, cwd }, "Discard task failed");
      this.options.emit({
        type: "task_discard_response",
        payload: {
          cwd,
          success: false,
          branchDeleted: false,
          error: toShipError(error),
          requestId,
        },
      });
    }
  }

  private async resolveForgeService(cwd: string): Promise<ForgeService | null> {
    return (await this.options.workspaceGitService.resolveForge(cwd))?.service ?? null;
  }
}
