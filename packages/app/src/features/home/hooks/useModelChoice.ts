import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { defaultChoice } from "@/features/home/utils/modelChoice";
import type { ModelChoice } from "@/features/home/types";
import type { Project } from "@/types";

/** The agent and model the next task starts with: the project's defaults until you pick another for it. */
export function useModelChoice(project: Project | undefined) {
  const providers = useStore((s) => s.providers);
  const [picked, setPicked] = useState<{
    projectId: string | undefined;
    choice: ModelChoice;
  } | null>(null);
  const own = picked?.projectId === project?.id ? picked?.choice : undefined;

  return {
    choice: own ?? defaultChoice(providers, project?.settings),
    setChoice: (choice: ModelChoice) => setPicked({ projectId: project?.id, choice }),
  };
}
