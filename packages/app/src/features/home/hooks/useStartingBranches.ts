import type { Project } from "@/types";
import { useStore } from "@/stores/app-store";

/** Branches a new worktree can start from: the project's default, then every branch another task is still working on. */
export function useStartingBranches(project: Project) {
  const agents = useStore((s) => s.agents);
  const open = Object.values(agents).filter(
    (a) => a.projectId === project.id && a.aspect !== "merged" && a.aspect !== "discarded",
  );
  return [project.defaultBranch, ...open.map((a) => a.branch)];
}
