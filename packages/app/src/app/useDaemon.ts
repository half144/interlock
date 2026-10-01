import { useEffect } from "react";
import { reconnectNow, startDaemon } from "@/daemon/connection";
import { useDaemonStatus } from "@/platform/hooks/useDaemonStatus";
import { useStore } from "@/stores/app-store";

/** Connects to the daemon, drops the connection while the shell reports it crashed, and connects the moment it is ready. */
export function useDaemon() {
  const shell = useDaemonStatus();
  const crashed = shell === "crashed";

  useEffect(() => {
    if (crashed) {
      useStore.getState().setDaemon({ phase: "crashed", synced: false });
      return undefined;
    }
    return startDaemon();
  }, [crashed]);

  useEffect(() => {
    if (shell === "ready") reconnectNow();
  }, [shell]);
}
