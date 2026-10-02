import { useStore } from "@/stores/app-store";
import type { DaemonPhase } from "@/stores/slices/daemon";

const PHASE_TEXT: Record<DaemonPhase, string | null> = {
  connecting: "Connecting…",
  connected: null,
  disconnected: "Connection lost. Reconnecting…",
  crashed: "Interlock stopped unexpectedly. Restarting…",
};

/** What to tell the user about the daemon: its connection while it is not healthy, else the last action that failed. */
export function useDaemonNotice() {
  const phase = useStore((s) => s.daemon.phase);
  const actionError = useStore((s) => s.actionError);
  const dismissError = useStore((s) => s.dismissError);
  const status = PHASE_TEXT[phase];

  if (status) return { tone: "status" as const, text: status };
  if (actionError) return { tone: "error" as const, text: actionError.text, dismiss: dismissError };
  return null;
}
