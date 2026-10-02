import { useStore } from "@/stores/app-store";
import { useProject } from "@/stores/selectors";
import { byRecentActivity } from "@/lib/threads";

/**
 * The sidebar's tasks, most recent activity first, narrowed to the project filter. `order` changes only when
 * the list's order does, so row reflow animates on real reorders and never on the store's tick.
 */
export function useSidebarTasks() {
  const threads = useStore((s) => s.threads);
  const view = useStore((s) => s.view);
  const projectFilter = useStore((s) => s.projectFilter);
  const setProjectFilter = useStore((s) => s.setProjectFilter);
  const filtered = useProject(projectFilter);

  const tasks = Object.values(threads)
    .filter((t) => !projectFilter || t.projectId === projectFilter)
    .sort(byRecentActivity);

  return {
    tasks,
    order: tasks.map((t) => t.id).join(),
    filterName: filtered?.label,
    activeThreadId: view.kind === "thread" ? view.threadId : null,
    clearFilter: projectFilter ? () => setProjectFilter(null) : null,
  };
}
