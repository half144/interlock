import { projectOf } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import { byRecentActivity } from "@/lib/threads";

/**
 * The sidebar's tasks, most recent activity first, narrowed to the project filter. `order` changes only when
 * the list's order does, so row reflow animates on real reorders and never on the store's tick.
 */
export function useSidebarTasks() {
  const threads = useStore((s) => s.threads);
  const projectFilter = useStore((s) => s.projectFilter);

  const tasks = Object.values(threads)
    .filter((t) => !projectFilter || t.projectId === projectFilter)
    .sort(byRecentActivity);

  return {
    tasks,
    order: tasks.map((t) => t.id).join(),
    filterName: projectFilter ? projectOf(projectFilter).name : undefined,
  };
}
