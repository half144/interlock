import { useRef } from "react";
import { useStore } from "@/stores/app-store";
import { useProject } from "@/stores/selectors";
import { SECTIONS } from "@/features/settings/utils/sections";
import { useScrollSpy } from "@/features/settings/hooks/useScrollSpy";

const SECTION_IDS = SECTIONS.map((s) => s.id);

export function useSettingsView(projectId: string) {
  const project = useProject(projectId);
  const go = useStore((s) => s.go);
  const scroller = useRef<HTMLDivElement>(null);
  return {
    project,
    scroller,
    openAccounts: () => go({ kind: "accounts" }),
    ...useScrollSpy(scroller, SECTION_IDS),
  };
}
