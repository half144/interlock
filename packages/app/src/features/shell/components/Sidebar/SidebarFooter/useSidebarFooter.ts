import { useStore } from "@/stores/app-store";
import { useProjectList } from "@/stores/selectors";
import { settingsView } from "@/features/shell/utils/settingsTarget";

export function useSidebarFooter() {
  const view = useStore((s) => s.view);
  const agents = useStore((s) => s.agents);
  const projectFilter = useStore((s) => s.projectFilter);
  const go = useStore((s) => s.go);
  const projects = useProjectList();

  return {
    active: view.kind === "settings" || view.kind === "accounts",
    openSettings: () =>
      go(settingsView({ view, agents, projectFilter, projectIds: projects.map((p) => p.id) })),
  };
}
