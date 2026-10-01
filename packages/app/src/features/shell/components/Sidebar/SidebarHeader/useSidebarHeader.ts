import { useStore } from "@/stores/app-store";

export function useSidebarHeader() {
  const setSidebar = useStore((s) => s.setSidebar);
  return { expand: () => setSidebar("open"), collapse: () => setSidebar("rail") };
}
