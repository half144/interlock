import { useState } from "react";
import { pickFolder } from "@/platform/desktop";
import { useStore } from "@/stores/app-store";
import { useProjectList } from "@/stores/selectors";
import { projectsNeedingYou } from "@/features/shell/utils/attention";

const hasNativePicker = "__TAURI_INTERNALS__" in globalThis;

interface AddFlow {
  path: string;
  error: string | null;
}

export function useSidebarProjects() {
  const projects = useProjectList();
  const agents = useStore((s) => s.agents);
  const go = useStore((s) => s.go);
  const projectFilter = useStore((s) => s.projectFilter);
  const setProjectFilter = useStore((s) => s.setProjectFilter);
  const tryAddProject = useStore((s) => s.tryAddProject);
  const [flow, setFlow] = useState<AddFlow | null>(null);

  const submit = async (path: string) => {
    const error = await tryAddProject(path.trim());
    setFlow(error ? { path, error } : null);
  };

  const add = async () => {
    const path = await pickFolder();
    if (path) await submit(path);
    else if (!hasNativePicker) setFlow({ path: "", error: null });
  };

  return {
    projects,
    needsYou: projectsNeedingYou(agents),
    go,
    projectFilter,
    setProjectFilter,
    add: () => void add(),
    flow,
    submit,
    closeFlow: () => setFlow(null),
  };
}
