import type { SliceCreator } from "../types";

export type DaemonPhase = "connecting" | "connected" | "disconnected" | "crashed";

interface DaemonState {
  phase: DaemonPhase;
  /** Set once the first sync after a connection has filled the store. */
  synced: boolean;
  error: string | null;
}

interface ActionError {
  id: number;
  text: string;
}

export interface DaemonSlice {
  daemon: DaemonState;
  /** The latest action the daemon refused or that failed on the way; shown until dismissed. */
  actionError: ActionError | null;

  setDaemon: (patch: Partial<DaemonState>) => void;
  reportError: (error: unknown) => void;
  dismissError: () => void;
}

let errorSeq = 0;

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Try again.";

export const createDaemonSlice: SliceCreator<DaemonSlice> = (set) => ({
  daemon: { phase: "connecting", synced: false, error: null },
  actionError: null,

  setDaemon: (patch) => set((s) => ({ daemon: { ...s.daemon, ...patch } })),
  reportError: (error) => set({ actionError: { id: ++errorSeq, text: messageOf(error) } }),
  dismissError: () => set({ actionError: null }),
});
