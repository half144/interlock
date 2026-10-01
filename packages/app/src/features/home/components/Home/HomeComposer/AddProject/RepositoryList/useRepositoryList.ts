import { useEffect, useState } from "react";
import * as daemon from "@/daemon/repositories";
import { useStore } from "@/stores/app-store";
import type { DiscoveredRepository } from "@/types";
import { lastActive, parentFolder } from "@/features/home/utils/repositories";

const SHOWN = 5;

// Asked only once the store has synced: the empty home also flashes by before the projects arrive.
export function useRepositoryList() {
  const synced = useStore((s) => s.daemon.synced);
  const reportError = useStore((s) => s.reportError);
  const [found, setFound] = useState<{ repositories: DiscoveredRepository[]; at: number } | null>(
    null,
  );

  useEffect(() => {
    if (!synced) return undefined;
    let current = true;
    daemon
      .discoverRepositories(SHOWN)
      .then((repositories) => current && setFound({ repositories, at: Date.now() }))
      .catch((error: unknown) => current && reportError(error));
    return () => {
      current = false;
    };
  }, [synced, reportError]);

  if (!found) return { rows: [] };
  return {
    rows: found.repositories.map((repo) => ({
      path: repo.path,
      name: repo.name,
      folder: parentFolder(repo.path),
      active: lastActive(repo.lastActivityAt, found.at),
    })),
  };
}
