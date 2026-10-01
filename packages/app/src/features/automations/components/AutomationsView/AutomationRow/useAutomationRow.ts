import { useProject } from "@/stores/selectors";

export function useAutomationRow(projectId: string) {
  return { projectName: useProject(projectId)?.name ?? "" };
}
