import { useModelChoice } from "@/features/home/hooks/useModelChoice";
import { useProjectChoice } from "@/features/home/hooks/useProjectChoice";

export function useHome() {
  const target = useProjectChoice();
  const { choice, setChoice } = useModelChoice(target.project);
  return { target, choice, setChoice };
}
