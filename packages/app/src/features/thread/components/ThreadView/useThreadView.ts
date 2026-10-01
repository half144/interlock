import { useStore } from "@/stores/app-store";
import { useSidebarWidth } from "@/hooks/useRail";
import { useSplit } from "@/features/thread/hooks/useSplit";
import { useThread } from "@/features/thread/hooks/useThread";

export function useThreadView(threadId: string) {
  const { agent } = useThread(threadId);
  const panelOpen = useStore((s) => s.panelOpen);
  const maximized = useStore((s) => s.reviewMaximized);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const frame = useSplit(panelOpen, useSidebarWidth(), maximized);

  return { agent, panelOpen, maximized, frame, closePanel: () => setPanelOpen(false) };
}
