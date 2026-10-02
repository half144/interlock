import { SIDEBAR_WIDTH, useSidebarWidth } from "@/hooks/useRail";
import { TRAFFIC_LIGHT_INSET } from "@/lib/layout";
import { useStore } from "@/stores/app-store";

/** With the sidebar folded to its rail the window buttons overhang into this bar, so it steps aside for them. */
export function useMainBar() {
  const width = useSidebarWidth();
  const setSidebar = useStore((s) => s.setSidebar);
  return {
    overhang: width > 0 && width < TRAFFIC_LIGHT_INSET,
    overhangBy: TRAFFIC_LIGHT_INSET - SIDEBAR_WIDTH.rail,
    expand: () => setSidebar("open"),
  };
}
