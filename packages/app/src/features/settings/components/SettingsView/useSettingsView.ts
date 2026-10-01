import { useRef } from "react";
import { useStore } from "@/stores/app-store";
import { useProject } from "@/stores/selectors";
import { sectionsFor } from "@/features/settings/utils/sections";
import { useScrollSpy } from "@/features/settings/hooks/useScrollSpy";

export function useSettingsView(projectId: string) {
  const project = useProject(projectId);
  const go = useStore((s) => s.go);
  const scroller = useRef<HTMLDivElement>(null);
  const sections = sectionsFor(project?.git ?? true);
  return {
    project,
    sections,
    scroller,
    openAccounts: () => go({ kind: "accounts" }),
    ...useScrollSpy(
      scroller,
      sections.map((s) => s.id),
    ),
  };
}
