import { useSidebarWidth } from "@/hooks/useRail";
import { barInset } from "@/lib/layout";

/** Beside the window controls the bar's contents start further in: by whatever the sidebar doesn't already cover. */
export function useMainBar() {
  return { inset: barInset(useSidebarWidth()) };
}
