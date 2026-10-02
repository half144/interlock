import { useStore } from "@/stores/app-store";
import { useProjectList } from "@/stores/selectors";
import { settingsTarget } from "@/features/shell/utils/settingsTarget";

export function useSidebarFooter() {
  const view = useStore((s) => s.view);
  const agents = useStore((s) => s.agents);
  const projectFilter = useStore((s) => s.projectFilter);
  const go = useStore((s) => s.go);
  const projects = useProjectList();
  const projectId = settingsTarget({
    view,
    agents,
    projectFilter,
    projectIds: projects.map((p) => p.id),
  });

  return {
    active: view.kind === "settings" || view.kind === "accounts",
    openSettings: () => go(projectId ? { kind: "settings", projectId } : { kind: "accounts" }),
  };
}
