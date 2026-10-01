import { useEffect, useState } from "react";
import * as daemon from "@/daemon/commands";
import { useStore } from "@/stores/app-store";
import type { Project } from "@/types";
import { orderBranches } from "@/features/home/utils/branches";

const SEARCH_DELAY_MS = 150;

/** The branches of the repository, narrowed by what is typed, with the project's default first. */
export function useBranchMenu(project: Project) {
  const reportError = useStore((s) => s.reportError);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<string[]>([]);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      daemon
        .searchBranches(project.rootPath, query)
        .then((names) => current && setFound(names))
        .catch((error: unknown) => current && reportError(error));
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [project.rootPath, query, reportError]);

  return { query, setQuery, branches: orderBranches(project.defaultBranch, found, query) };
}
