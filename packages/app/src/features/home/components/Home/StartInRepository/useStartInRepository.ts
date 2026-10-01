import { useEffect, useState } from "react";
import * as daemon from "@/daemon/repositories";
import { useStore } from "@/stores/app-store";
import type { DiscoveredRepository } from "@/types";
import { lastActive, parentFolder } from "@/features/home/utils/repositories";

const SHOWN = 12;

// Asked only once the store has synced: the empty home also flashes by before the projects arrive.
export function useStartInRepository() {
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

  if (!found) return { chips: [] };
  return {
    chips: found.repositories.map((repo) => ({
      path: repo.path,
      name: repo.name,
      title: `${parentFolder(repo.path)}/${repo.name} · active ${lastActive(repo.lastActivityAt, found.at)}`,
    })),
  };
}
