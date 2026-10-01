import { useStore } from "@/stores/app-store";
import { activityOf } from "@/daemon/adapters/attention";
import { useActivitySync, useFocusedTaskSync } from "@/platform/hooks/useDesktopSync";
import { useOpenTask } from "@/platform/hooks/useOpenTask";

/** Tells the desktop shell what the app is doing (menu bar counts, the task on screen) and lets it open a task. */
export function usePlatformSync() {
  const focused = useStore((s) => (s.view.kind === "thread" ? s.view.threadId : null));
  const openThread = useStore((s) => s.openThread);
  const running = useStore((s) => activityOf(Object.values(s.agents)).running);
  const waiting = useStore((s) => activityOf(Object.values(s.agents)).waiting);

  useActivitySync(running, waiting);
  useFocusedTaskSync(focused);
  useOpenTask(openThread);
}
