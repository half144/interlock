import { useMemo } from "react";
import { useStore } from "./app-store";

/** Projects in the order the sidebar lists them: by name. */
export function useProjectList() {
  const projects = useStore((s) => s.projects);
  return useMemo(
    () => Object.values(projects).sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );
}

export const useProject = (projectId: string | null | undefined) =>
  useStore((s) => (projectId ? s.projects[projectId] : undefined));
