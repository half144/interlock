import { useStore } from "@/stores/app-store";
import type { DaemonPhase } from "@/stores/slices/daemon";

const PHASE_TEXT: Record<DaemonPhase, string | null> = {
  connecting: "Connecting to the daemon…",
  connected: null,
  disconnected: "Lost the daemon. Reconnecting…",
  crashed: "The daemon stopped. Restarting it…",
};

/** What to tell the user about the daemon: its connection while it is not healthy, else the last action that failed. */
export function useDaemonNotice() {
  const phase = useStore((s) => s.daemon.phase);
  const error = useStore((s) => s.daemon.error);
  const actionError = useStore((s) => s.actionError);
  const dismissError = useStore((s) => s.dismissError);
  const status = PHASE_TEXT[phase];

  if (status) return { tone: "status" as const, text: error ? `${status} ${error}` : status };
  if (actionError) return { tone: "error" as const, text: actionError.text, dismiss: dismissError };
  return null;
}
