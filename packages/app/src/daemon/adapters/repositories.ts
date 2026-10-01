import type { DiscoveredRepository as RepositoryPayload } from "@interlock/protocol/project-discovery-schema";
import type { DiscoveredRepository } from "@/types";

export const toDiscoveredRepository = (repo: RepositoryPayload): DiscoveredRepository => ({
  path: repo.path,
  name: repo.name,
  lastActivityAt: Date.parse(repo.lastActivityAt),
});
