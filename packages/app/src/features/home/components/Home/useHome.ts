import { useAddProject } from "@/features/home/hooks/useAddProject";
import { useModelChoice } from "@/features/home/hooks/useModelChoice";
import { useProjectChoice } from "@/features/home/hooks/useProjectChoice";

export function useHome() {
  const target = useProjectChoice();
  const { choice, setChoice } = useModelChoice(target.project);
  const hasProjects = target.project !== undefined;
  const setup = useAddProject(!hasProjects);
  return { target, choice, setChoice, hasProjects, setup };
}
