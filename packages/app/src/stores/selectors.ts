import { useMemo } from "react";
import type { Project } from "@/types";
import { useStore } from "./app-store";

/** Projects in the order the sidebar lists them: by name. */
export const projectsByLabel = (projects: Record<string, Project>) =>
  Object.values(projects).sort((a, b) => a.label.localeCompare(b.label));

export function useProjectList() {
  const projects = useStore((s) => s.projects);
  return useMemo(() => projectsByLabel(projects), [projects]);
}

export const useProject = (projectId: string | null | undefined) =>
  useStore((s) => (projectId ? s.projects[projectId] : undefined));
