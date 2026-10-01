import { useEffect } from "react";
import { startDaemon } from "@/daemon/connection";
import { useDaemonStatus } from "@/platform/hooks/useDaemonStatus";
import { useStore } from "@/stores/app-store";

/** Connects to the daemon; when the desktop shell reports it crashed and later ready, connects again. */
export function useDaemon() {
  const shell = useDaemonStatus();

  useEffect(() => {
    if (shell === "crashed") {
      useStore.getState().setDaemon({ phase: "crashed", synced: false });
      return undefined;
    }
    return startDaemon();
  }, [shell]);
}
