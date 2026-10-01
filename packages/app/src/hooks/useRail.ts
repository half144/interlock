import { useStore } from "@/stores/app-store";

export const SIDEBAR_WIDTH = { open: 264, rail: 52 };

/** The sidebar folds to icons when you ask, or by itself while a task's side panel is open. */
export function useRail() {
  return useStore(
    (s) =>
      s.sidebar === "rail" || (s.sidebar === "auto" && s.view.kind === "thread" && s.panelOpen),
  );
}

/** How wide the sidebar is heading to be. The maximized review takes the whole window, so there it steps out entirely. */
export function useSidebarWidth() {
  const rail = useRail();
  const maximized = useStore((s) => s.reviewMaximized);
  return maximized ? 0 : rail ? SIDEBAR_WIDTH.rail : SIDEBAR_WIDTH.open;
}
