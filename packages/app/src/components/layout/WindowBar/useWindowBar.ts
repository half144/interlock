import { SIDEBAR_WIDTH, useSidebarWidth } from "@/hooks/useRail";
import { useStore } from "@/stores/app-store";
import { sidebarToggle } from "./sidebarToggle";

export function useWindowBar() {
  const sidebarWidth = useSidebarWidth();
  const maximized = useStore((s) => s.reviewMaximized);
  const setMaximized = useStore((s) => s.setReviewMaximized);
  const setSidebar = useStore((s) => s.setSidebar);
  const { label, action } = sidebarToggle(maximized, sidebarWidth < SIDEBAR_WIDTH.open);

  return {
    sidebarWidth,
    label,
    toggle: () => (action === "restore" ? setMaximized(false) : setSidebar(action)),
  };
}
