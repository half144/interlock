import type { DiscoveredRepository } from "@/types";
import { toDiscoveredRepository } from "./adapters/repositories";
import { getClient } from "./client";

/** The git repositories on this machine, most recently worked on first. */
export async function discoverRepositories(limit: number): Promise<DiscoveredRepository[]> {
  const result = await getClient().discoverRepositories(limit);
  if (result.error) throw new Error(result.error);
  return result.repositories.map(toDiscoveredRepository);
}
