import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { useProjectList } from "@/stores/selectors";

/** The project the next task runs in and the branch it starts from; a "new task in <project>" request switches the project. */
export function useProjectChoice() {
  const preset = useStore((s) => s.newTaskProjectId);
  const projects = useProjectList();
  const [chosenId, setProjectId] = useState<string | null>(preset);
  const [seenPreset, setSeenPreset] = useState(preset);
  const [picked, setPicked] = useState<{ projectId: string; branch: string } | null>(null);

  if (preset !== seenPreset) {
    setSeenPreset(preset);
    if (preset) setProjectId(preset);
  }

  const project = projects.find((p) => p.id === chosenId) ?? projects[0];
  const base = picked && picked.projectId === project?.id ? picked.branch : project?.defaultBranch;
  const setBase = (branch: string) => {
    if (project) setPicked({ projectId: project.id, branch });
  };

  return { preset, project, setProjectId, base, setBase };
}

export type ProjectChoice = ReturnType<typeof useProjectChoice>;
