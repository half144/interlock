import { useEffect } from "react";
import { useStore } from "@/stores/app-store";
import { projectsByLabel } from "@/stores/selectors";
import { settingsView } from "@/features/shell/utils/settingsTarget";
import { isTyping } from "@/lib/utils";

/** Global keys: ⌘K palette, ⌘, settings, D new task, G then H home, Escape closes overlays. */
export function useHotkeys() {
  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.setPalette(!s.paletteOpen);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        s.go(
          settingsView({
            view: s.view,
            agents: s.agents,
            projectFilter: s.projectFilter,
            projectIds: projectsByLabel(s.projects).map((p) => p.id),
          }),
        );
        return;
      }
      if (e.key === "Escape") {
        if (e.defaultPrevented) return;
        if (s.paletteOpen) s.setPalette(false);
        else if (s.reviewMaximized) s.setReviewMaximized(false);
        else if (s.panelOpen) s.setPanelOpen(false);
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey || s.paletteOpen) return;
      if (e.key === "d") {
        e.preventDefault();
        s.newTask();
      } else if (e.key === "g") {
        lastG = Date.now();
      } else if (Date.now() - lastG < 800) {
        if (e.key === "h") s.go({ kind: "yard" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
