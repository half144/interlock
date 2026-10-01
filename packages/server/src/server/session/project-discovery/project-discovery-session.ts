import { homedir } from "node:os";
import type pino from "pino";
import type { SessionInboundMessage, SessionOutboundMessage } from "../../messages.js";
import { findRepositories } from "../../project-discovery/find-repositories.js";

type DiscoverRequest = Extract<SessionInboundMessage, { type: "project.discover.request" }>;

const DEFAULT_LIMIT = 5;

export interface ProjectDiscoverySessionOptions {
  host: { emit(msg: SessionOutboundMessage): void };
  logger: pino.Logger;
  home?: string;
}

export class ProjectDiscoverySession {
  constructor(private readonly options: ProjectDiscoverySessionOptions) {}

  async handleDiscoverRequest(msg: DiscoverRequest): Promise<void> {
    try {
      const found = await findRepositories(
        this.options.home ?? homedir(),
        msg.limit ?? DEFAULT_LIMIT,
      );
      this.options.host.emit({
        type: "project.discover.response",
        payload: {
          requestId: msg.requestId,
          repositories: found.map((repo) => ({
            path: repo.path,
            name: repo.name,
            lastActivityAt: repo.lastActivityAt.toISOString(),
          })),
          error: null,
        },
      });
    } catch (error) {
      this.options.logger.warn({ err: error }, "Repository discovery failed");
      this.options.host.emit({
        type: "project.discover.response",
        payload: {
          requestId: msg.requestId,
          repositories: [],
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
